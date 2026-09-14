import { useSyncExternalStore } from 'react'

import { compressImage } from '@/lib/compress-image'

/**
 * 변환하려고 고른 문서 (촬영 · 사진첩 사진 여러 장, 또는 PDF 한 개).
 *
 * 홈 → 촬영한 문서 확인 → 결과 화면이 같이 쓴다. 파일은 주소에 담을 수 없어 이 탭의 메모리에만 둔다.
 * 개인정보라서 오래 들고 있지 않는다: 홈으로 돌아오면 비우고, 변환을 시작하면 결과 화면이 비운다.
 * 미리보기 주소(URL.createObjectURL)는 비우거나 바꿀 때 모두 해제한다.
 *
 * 제한은 docs/api-contract.md "업로드" 를 따른다.
 */

/** 한 문서에 올릴 수 있는 사진 장수 */
export const MAX_PAGES = 10
/** 줄인 뒤 사진 한 장의 최대 크기 */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
/** PDF 최대 크기. 백엔드와 합의 전이라 제안한 값(20MB)을 쓴다 (docs/api-contract.md "백엔드에 보낼 제안" 6번) */
const MAX_PDF_BYTES = 20 * 1024 * 1024

export type ImageSource = 'camera' | 'gallery'

export interface DraftPage {
  id: string
  file: File
  previewUrl: string
}

export type DocumentDraft =
  | { kind: 'images'; source: ImageSource; pages: DraftPage[] }
  | { kind: 'pdf'; file: File }

/** 사용자에게 알림 모달로 보여 줄 제목 · 다음에 할 일 */
export interface DraftNotice {
  title: string
  description: string
}

/** 사진 · 파일을 받지 못한 이유. 화면이 notice 를 알림 모달로 보여 준다 */
class DraftError extends Error {
  readonly notice: DraftNotice

  constructor(notice: DraftNotice) {
    super(notice.title)
    this.name = 'DraftError'
    this.notice = notice
  }
}

/** 사진 · 파일을 넣다가 난 오류를 알림 모달 문구로 바꾼다 */
export function toDraftNotice(error: unknown): DraftNotice {
  return error instanceof DraftError
    ? error.notice
    : { title: '문서를 불러오지 못했어요', description: '다시 골라주세요.' }
}

/** 10장이 넘게 골라 일부만 넣었을 때 */
export const PAGE_LIMIT_NOTICE: DraftNotice = {
  title: `사진은 ${MAX_PAGES}장까지 올릴 수 있어요`,
  description: `${MAX_PAGES}장이 넘는 사진은 빼고 넣었어요.`,
}

let currentDraft: DocumentDraft | null = null
let nextPageId = 1
const listeners = new Set<() => void>()

function previewUrls(draft: DocumentDraft | null) {
  return draft?.kind === 'images'
    ? draft.pages.map((page) => page.previewUrl)
    : []
}

function setDraft(next: DocumentDraft | null) {
  // 사진을 추가할 때처럼 새 초안에도 남는 사진의 미리보기 주소는 해제하지 않는다
  const kept = new Set(previewUrls(next))
  for (const url of previewUrls(currentDraft)) {
    if (!kept.has(url)) URL.revokeObjectURL(url)
  }
  currentDraft = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getDocumentDraft() {
  return currentDraft
}

async function toPages(files: File[]): Promise<DraftPage[]> {
  if (!files.every((file) => file.type.startsWith('image/'))) {
    throw new DraftError({
      title: '사진만 고를 수 있어요',
      description: '사진 파일을 다시 골라주세요.',
    })
  }
  const compressed = await Promise.all(
    files.map((file) =>
      compressImage(file).catch(() => {
        throw new DraftError({
          title: '열 수 없는 사진이 있어요',
          description: '다른 사진을 골라주세요.',
        })
      }),
    ),
  )
  if (compressed.some((file) => file.size > MAX_IMAGE_BYTES)) {
    throw new DraftError({
      title: '사진이 너무 커요',
      description: '다른 사진을 골라주세요.',
    })
  }
  return compressed.map((file) => ({
    id: `page-${nextPageId++}`,
    file,
    previewUrl: URL.createObjectURL(file),
  }))
}

/** 새 사진 문서를 시작한다. 10장이 넘으면 앞에서부터 10장만 쓰고, 잘렸는지 알려 준다 */
export async function startImageDraft(source: ImageSource, files: File[]) {
  const accepted = files.slice(0, MAX_PAGES)
  const pages = await toPages(accepted)
  setDraft({ kind: 'images', source, pages })
  return { truncated: accepted.length < files.length }
}

/** 지금 사진 문서에 사진을 더한다. 남은 장수만큼만 더하고, 잘렸는지 알려 준다 */
export async function addDraftImages(files: File[]) {
  const draft = currentDraft
  if (draft?.kind !== 'images') return { truncated: false }
  const remaining = MAX_PAGES - draft.pages.length
  const accepted = files.slice(0, Math.max(0, remaining))
  const pages = await toPages(accepted)
  // 줄이는 동안 문서가 바뀌었으면(홈으로 나감 등) 버린다
  if (currentDraft !== draft) {
    for (const page of pages) URL.revokeObjectURL(page.previewUrl)
    return { truncated: false }
  }
  setDraft({ ...draft, pages: [...draft.pages, ...pages] })
  return { truncated: accepted.length < files.length }
}

export function startPdfDraft(file: File) {
  if (file.type !== 'application/pdf') {
    throw new DraftError({
      title: 'PDF 파일만 불러올 수 있어요',
      description: 'PDF 파일을 다시 골라주세요.',
    })
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new DraftError({
      title: '파일이 너무 커요',
      description: '20MB 보다 작은 파일을 골라주세요.',
    })
  }
  setDraft({ kind: 'pdf', file })
}

/** 변환 요청에 보낼 파일. 사진은 순서대로 */
export function getDraftFiles(draft: DocumentDraft) {
  return draft.kind === 'images'
    ? draft.pages.map((page) => page.file)
    : [draft.file]
}

export function clearDocumentDraft() {
  setDraft(null)
}

export function useDocumentDraft() {
  return useSyncExternalStore(subscribe, getDocumentDraft)
}
