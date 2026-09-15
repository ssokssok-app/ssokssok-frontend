import { createFileRoute, redirect } from '@tanstack/react-router'
import { type ChangeEvent, useRef, useState } from 'react'

import warningImage from '@/assets/images/warning.png'
import { Modal, ModalClose } from '@/components/modal'
import { startConversionSession } from '@/hooks/useConversionSession'
import {
  addDraftImages,
  type DraftNotice,
  getDocumentDraft,
  getDraftFiles,
  MAX_PAGES,
  PAGE_LIMIT_NOTICE,
  removeDraftPage,
  toDraftNotice,
  useDocumentDraft,
} from '@/hooks/useDocumentDraft'

import { ReviewView } from './-review/review-view'

/*
 * 촬영한 문서 확인 (Figma 221:2840). 촬영하거나 사진첩에서 고른 사진을 확인하고, 더 추가하거나 지운 뒤 변환을 시작한다.
 * 사진은 메모리에만 있어서, 새로고침 등으로 사진이 없으면 홈으로 보낸다.
 */
export const Route = createFileRoute('/review')({
  beforeLoad: () => {
    if (getDocumentDraft()?.kind !== 'images') throw redirect({ to: '/' })
  },
  component: ReviewPage,
})

function ReviewPage() {
  const draft = useDocumentDraft()
  const navigate = Route.useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  // 읽어야 하는 알림이라 Toast 대신 모달로 띄운다. 닫히는 동안에도 문구가 보이도록 내용과 열림을 따로 둔다
  const [notice, setNotice] = useState<DraftNotice | null>(null)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const addInputRef = useRef<HTMLInputElement>(null)

  // 홈으로 나가는 중에 초안이 비면 아무것도 그리지 않는다
  if (draft?.kind !== 'images') return null

  const { pages, source } = draft
  // 고른 사진이 없으면(처음 · 방금 추가) 마지막 사진을 크게 보여 준다
  const selectedIndex = Math.max(
    0,
    selectedId === null
      ? pages.length - 1
      : pages.findIndex((page) => page.id === selectedId),
  )
  const selectedPage = pages[selectedIndex]
  const full = pages.length >= MAX_PAGES

  function showNotice(next: DraftNotice) {
    setNotice(next)
    setNoticeOpen(true)
  }

  function handleAddClick() {
    if (full) {
      showNotice({
        title: PAGE_LIMIT_NOTICE.title,
        description: `이미 ${MAX_PAGES}장을 모두 넣었어요.`,
      })
      return
    }
    addInputRef.current?.click()
  }

  function handleDeleteClick() {
    // 지운 자리의 다음 사진을, 마지막 사진이었으면 앞 사진을 크게 보여 준다
    const nextPage = pages[selectedIndex + 1] ?? pages[selectedIndex - 1]
    removeDraftPage(selectedPage.id)
    if (nextPage) setSelectedId(nextPage.id)
    // 한 장뿐이던 사진을 지우면 이 화면에서 할 일이 없어 홈으로 간다 (docs/product.md "문서 입력")
    else navigate({ to: '/' })
  }

  async function handleAddChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    // 같은 사진을 다시 골라도 onChange 가 오도록 비운다
    event.target.value = ''
    if (files.length === 0) return
    setAdding(true)
    try {
      const { truncated } = await addDraftImages(files)
      setSelectedId(null)
      if (truncated) showNotice(PAGE_LIMIT_NOTICE)
    } catch (error) {
      showNotice(toDraftNotice(error))
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      <ReviewView
        photos={pages.map((page) => ({ id: page.id, src: page.previewUrl }))}
        selectedIndex={selectedIndex}
        onSelect={(index) => setSelectedId(pages[index]?.id ?? null)}
        onBack={() => navigate({ to: '/' })}
        onAdd={handleAddClick}
        onDelete={handleDeleteClick}
        onConfirm={() => {
          // 누른 순간 변환을 시작하고, 결과 화면이 진행 상태를 보여 준다
          startConversionSession(getDraftFiles(draft))
          navigate({ to: '/result' })
        }}
        busy={adding}
      />

      {/* 추가는 처음 고른 방법 그대로: 촬영이면 카메라, 사진첩이면 사진첩 */}
      <input
        ref={addInputRef}
        type="file"
        accept="image/*"
        capture={source === 'camera' ? 'environment' : undefined}
        multiple={source === 'gallery'}
        hidden
        onChange={handleAddChange}
      />
      {/* Figma 에 없는 알림이라 개인정보 안내와 같은 Modal 에 경고 일러스트를 쓴다 (docs/product.md "확인 필요") */}
      <Modal
        open={noticeOpen}
        onOpenChange={setNoticeOpen}
        illustration={warningImage}
        title={notice?.title ?? ''}
        description={notice?.description ?? ''}
      >
        <ModalClose>확인</ModalClose>
      </Modal>
    </>
  )
}
