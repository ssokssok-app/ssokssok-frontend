import { Button } from '@base-ui/react/button'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { type ChangeEvent, useRef, useState } from 'react'

import AddIcon from '@/assets/icons/24/add.svg?react'
import ArrowBackIosIcon from '@/assets/icons/24/arrow-back-ios.svg?react'
import CheckedSimpleIcon from '@/assets/icons/24/checked-simple.svg?react'
import warningImage from '@/assets/images/warning.png'
import { CtaButton } from '@/components/cta-button'
import { Gnb, GnbIconButton } from '@/components/gnb'
import { Modal, ModalClose } from '@/components/modal'
import { startConversionSession } from '@/hooks/useConversionSession'
import {
  addDraftImages,
  type DraftNotice,
  getDocumentDraft,
  getDraftFiles,
  MAX_PAGES,
  PAGE_LIMIT_NOTICE,
  toDraftNotice,
  useDocumentDraft,
} from '@/hooks/useDocumentDraft'
import { cn } from '@/lib/utils'

/*
 * 촬영한 문서 확인 (Figma 8:691). 촬영하거나 사진첩에서 고른 사진을 확인하고 더 추가한 뒤 변환을 시작한다.
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
    <div className="flex min-h-dvh flex-col bg-white pt-[env(safe-area-inset-top)] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <Gnb
        tone="dark"
        title="촬영한 문서 확인"
        left={
          <GnbIconButton
            label="뒤로 가기"
            icon={ArrowBackIosIcon}
            onClick={() => navigate({ to: '/' })}
          />
        }
      />

      <main className="flex flex-1 flex-col">
        {/* Figma 글자색 #696969 는 팔레트에 없어 가장 가까운 Gray/600 을 쓴다 (docs/product.md) */}
        <p className="mt-1.5 px-5 text-center text-subtitle-semibold whitespace-pre-line text-gray-600">
          {'문서를 모두 찍었다면\n하단 파란색 버튼을 눌러주세요'}
        </p>

        {/*
         * 사진 전체가 보이도록 잘라내지 않고 틀 안에 맞춘다. 틀은 남은 세로 공간을 채우고(최소 240px),
         * 사진은 절대 위치라 세로로 긴 사진이어도 틀과 페이지가 늘어나지 않는다
         */}
        <div className="relative mx-5 mt-[25px] min-h-60 flex-1 overflow-hidden rounded-[20px] bg-gray-100">
          <img
            src={selectedPage.previewUrl}
            alt={`${selectedIndex + 1}번째 사진 크게 보기`}
            className="absolute inset-0 size-full object-contain"
          />
        </div>

        <div className="mt-[18px] overflow-x-auto [scrollbar-width:none]">
          <ul
            aria-label="찍은 사진"
            className="mx-auto flex w-max gap-3 px-5 py-0.5"
          >
            {pages.map((page, index) => {
              const selected = index === selectedIndex
              return (
                <li key={page.id}>
                  <Button
                    aria-label={`${index + 1}번째 사진`}
                    aria-pressed={selected}
                    onClick={() => setSelectedId(page.id)}
                    className={cn(
                      'relative block h-[93px] w-[76px] overflow-hidden rounded-[10px] bg-gray-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
                      // 선택 테두리는 사진 위에 겹쳐 그려 크기가 바뀌지 않게 한다
                      "after:absolute after:inset-0 after:rounded-[10px] after:border-[1.5px] after:border-transparent after:content-['']",
                      selected && 'after:border-blue-500',
                    )}
                  >
                    <img
                      src={page.previewUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                    <span
                      aria-hidden
                      className="absolute right-[9px] bottom-[9px] flex size-[1.8em] items-center justify-center rounded-full bg-blue-500 text-caption-s-semibold text-white"
                    >
                      {index + 1}
                    </span>
                  </Button>
                </li>
              )
            })}
            <li>
              <Button
                onClick={handleAddClick}
                disabled={adding}
                className="flex h-[93px] w-[76px] flex-col items-center justify-center gap-[11px] rounded-[10px] border border-dashed border-gray-400 text-body-semibold text-gray-500 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-80 data-disabled:opacity-40"
              >
                <AddIcon aria-hidden className="size-6" />
                추가
              </Button>
            </li>
          </ul>
        </div>

        <div className="mt-[35px] px-5">
          <CtaButton
            onClick={() => {
              // 누른 순간 변환을 시작하고, 결과 화면이 진행 상태를 보여 준다
              startConversionSession(getDraftFiles(draft))
              navigate({ to: '/result' })
            }}
          >
            <CheckedSimpleIcon aria-hidden />다 찍었어요
          </CtaButton>
        </div>
      </main>

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
    </div>
  )
}
