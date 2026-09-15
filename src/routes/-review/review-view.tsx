import { Button } from '@base-ui/react/button'

import AddIcon from '@/assets/icons/24/add.svg?react'
import ArrowBackIosIcon from '@/assets/icons/24/arrow-back-ios.svg?react'
import CheckedSimpleIcon from '@/assets/icons/24/checked-simple.svg?react'
import DeleteIcon from '@/assets/icons/24/delete.svg?react'
import { CtaButton } from '@/components/cta-button'
import { Gnb, GnbIconButton } from '@/components/gnb'
import { cn } from '@/lib/utils'

export interface ReviewPhoto {
  id: string
  /** 미리보기 주소 (고른 사진의 object URL 또는 샘플 예시 사진) */
  src: string
}

interface ReviewViewProps {
  photos: ReviewPhoto[]
  /** 크게 보여 줄 사진 번호 */
  selectedIndex: number
  onSelect: (index: number) => void
  onBack: () => void
  onAdd: () => void
  onDelete: () => void
  onConfirm: () => void
  /** 사진을 넣는 중이면 추가 · 지우기를 잠근다 */
  busy?: boolean
}

/**
 * 촬영한 문서 확인 화면 모양 (Figma 221:2840). 촬영 흐름(src/routes/review.tsx)과 샘플 흐름(src/routes/samples/$sampleId_.review.tsx)이 같이 쓴다.
 * 사진을 넣고 지우는 동작은 화면이 props 로 정한다.
 */
export function ReviewView({
  photos,
  selectedIndex,
  onSelect,
  onBack,
  onAdd,
  onDelete,
  onConfirm,
  busy = false,
}: ReviewViewProps) {
  const selectedPhoto = photos[selectedIndex]

  return (
    <div className="flex min-h-dvh flex-col bg-white pt-[env(safe-area-inset-top)] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <Gnb
        tone="dark"
        title="촬영한 문서 확인"
        left={
          <GnbIconButton
            label="뒤로 가기"
            icon={ArrowBackIosIcon}
            onClick={onBack}
          />
        }
      />

      <main className="flex flex-1 flex-col">
        <p className="mx-5 mt-2.5 rounded-[10px] border border-blue-300 bg-blue-80 px-4 py-[9px] text-caption-l-medium whitespace-pre-line text-blue-500">
          {
            '한 번에 같은 종류의 문서만 넣어주세요.\n서로 다른 문서를 함께 넣으면 읽지 못할 수 있어요.\n(ex. 근로계약서 + 과태료 고지서)'
          }
        </p>

        {/* 위아래 2px 은 선택 테두리 · 포커스 표시가 스크롤 영역에 잘리지 않게 둔 여백이라 바깥 간격에서 뺐다 */}
        <div className="mt-[19px] overflow-x-auto [scrollbar-width:none]">
          <ul aria-label="찍은 사진" className="flex w-max gap-3 px-5 py-0.5">
            {photos.map((photo, index) => {
              const selected = index === selectedIndex
              return (
                <li key={photo.id}>
                  <Button
                    aria-label={`${index + 1}번째 사진`}
                    aria-pressed={selected}
                    onClick={() => onSelect(index)}
                    className={cn(
                      'relative block h-full min-h-20 w-[68px] overflow-hidden rounded-[10px] bg-gray-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
                      // 선택 테두리는 사진 위에 겹쳐 그려 크기가 바뀌지 않게 한다
                      "after:absolute after:inset-0 after:rounded-[10px] after:border-[1.5px] after:border-transparent after:content-['']",
                      selected && 'after:border-blue-500',
                    )}
                  >
                    <img
                      src={photo.src}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
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
            {/* 칸 높이는 80px 을 기본으로 두고, 글자가 커져 넘치면 사진 칸도 같은 높이로 늘어난다 */}
            <li>
              <Button
                onClick={onAdd}
                disabled={busy}
                className="flex h-full min-h-20 w-[68px] flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-gray-400 text-body-semibold text-gray-500 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-80 data-disabled:opacity-40"
              >
                <AddIcon aria-hidden className="size-6" />
                추가
              </Button>
            </li>
          </ul>
        </div>

        {/*
         * 사진 전체가 보이도록 잘라내지 않고 틀 안에 맞춘다 (Figma 는 틀을 꽉 채워 잘림). 틀은 남은 세로 공간을 채우고(최소 240px),
         * 사진은 절대 위치라 세로로 긴 사진이어도 틀과 페이지가 늘어나지 않는다
         */}
        <div className="relative mx-5 mt-1.5 min-h-60 flex-1 overflow-hidden rounded-[16px] border border-gray-200 bg-gray-80">
          {selectedPhoto && (
            <img
              src={selectedPhoto.src}
              alt={`${selectedIndex + 1}번째 사진 크게 보기`}
              className="absolute inset-0 size-full object-contain"
            />
          )}
          {/* Figma 아이콘 색 #323232 는 팔레트에 없어 가장 가까운 Gray/800 을 쓴다 (docs/product.md) */}
          <Button
            aria-label={`${selectedIndex + 1}번째 사진 지우기`}
            onClick={onDelete}
            disabled={busy}
            className="absolute top-3.5 right-4 flex size-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-float select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-90 data-disabled:opacity-40"
          >
            <DeleteIcon aria-hidden className="size-6" />
          </Button>
        </div>

        <div className="mt-5 px-5">
          <CtaButton onClick={onConfirm}>
            <CheckedSimpleIcon aria-hidden />다 찍었어요
          </CtaButton>
        </div>
      </main>
    </div>
  )
}
