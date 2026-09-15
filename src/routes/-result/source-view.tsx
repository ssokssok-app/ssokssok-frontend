import { Dialog } from '@base-ui/react/dialog'
import { Fragment } from 'react'

import ArrowBackIosIcon from '@/assets/icons/24/arrow-back-ios.svg?react'
import { GnbIconButton } from '@/components/gnb'
import type { DocumentResult } from '@/types/document-result'

import { ResultHeader } from './result-header'
import { getSourceExcerpt } from './source-excerpt'

interface SourceViewProps {
  result: DocumentResult
  /** 원문을 볼 쉬운 문단 번호 (주소의 ?paragraph=). 없거나 그 문단에 원문이 없으면 닫힌다 */
  paragraphIndex: number | undefined
  onClose: () => void
}

/**
 * 원문 보기 (Figma 149:1798). 쉬운 문단과, 그 문단을 만든 원문 줄을 강조해 보여 준다 (src/routes/-result/source-excerpt.ts).
 *
 * 결과 화면 위에 화면 전체를 덮는 대화상자로 띄운다. 결과 화면을 그대로 두어서 닫으면 보던 위치로 돌아간다.
 * 원문 발췌 위아래는 흰색으로 흐려서 원문의 일부라는 것을 보여 준다 (Figma 149:1854 · 149:1855).
 */
export function SourceView({
  result,
  paragraphIndex,
  onClose,
}: SourceViewProps) {
  const paragraph =
    paragraphIndex === undefined
      ? null
      : (result.paragraphs[paragraphIndex] ?? null)
  const excerpt = paragraph && getSourceExcerpt(result.sourceLines, paragraph)

  return (
    <Dialog.Root
      open={Boolean(excerpt)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Popup className="fixed inset-0 z-40 mx-auto flex max-w-app flex-col overflow-y-auto overscroll-contain bg-gray-80 outline-none">
          <ResultHeader
            title={<Dialog.Title render={<span />}>원문 보기</Dialog.Title>}
            left={
              <GnbIconButton
                label="뒤로 가기"
                icon={ArrowBackIosIcon}
                onClick={onClose}
              />
            }
          />

          {paragraph && excerpt && (
            <div className="flex flex-col gap-4 pt-[30px] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="flex flex-col gap-8 px-5">
                <section className="flex flex-col gap-3">
                  <h2 className="text-subtitle-semibold text-gray-900">
                    선택한 문단
                  </h2>
                  <div className="flex flex-col gap-0.5 rounded-[10px] bg-white p-5 shadow-card">
                    {paragraph.title && (
                      <p className="text-subtitle-semibold text-gray-900">
                        {paragraph.title}
                      </p>
                    )}
                    <p className="text-body-regular whitespace-pre-line text-gray-900">
                      {paragraph.body}
                    </p>
                  </div>
                </section>

                <section className="flex flex-col gap-3">
                  <h2 className="text-subtitle-semibold text-gray-900">
                    원문의 이 부분에서 가져왔어요
                  </h2>
                  <div className="relative overflow-hidden rounded-[12px] bg-white p-5 shadow-card">
                    {/* 원문 줄들을 띄어쓰기로 이어 한 문단처럼 보여 준다. 조각 사이의 띄어쓰기는 강조 밖에 둔다 */}
                    <p className="text-body2-regular text-gray-900">
                      {excerpt.map((segment, index) => (
                        // 조각 순서는 바뀌지 않는다
                        <Fragment key={index}>
                          {index > 0 && ' '}
                          {segment.highlighted ? (
                            <mark className="bg-blue-500/10 box-decoration-clone text-body2-medium text-blue-500">
                              {segment.text}
                            </mark>
                          ) : (
                            segment.text
                          )}
                        </Fragment>
                      ))}
                    </p>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-[75px] bg-linear-to-b from-white/60 from-27% to-white/0"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-[68px] bg-linear-to-t from-white/60 from-27% to-white/0"
                    />
                  </div>
                </section>
              </div>

              <p className="px-5 text-caption-l-regular whitespace-pre-line text-gray-500">
                {
                  '※ 선택한 문단과 관련된 원문만 찾아서 보여드려요.\n원문 전체 내용은 포함되지 않아요.'
                }
              </p>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
