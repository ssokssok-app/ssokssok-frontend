import { Button } from '@base-ui/react/button'
import { useId, useState } from 'react'

import { EasyParagraph } from '@/components/easy-paragraph'
import { ListenButton } from '@/components/listen-button'
import {
  type ListeningSpeed,
  ListeningPopover,
} from '@/components/listening-popover'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import type { ResultParagraph } from '@/types/document-result'

import { useParagraphSpeech } from './use-paragraph-speech'

interface EasyBodyProps {
  id: string
  paragraphs: ResultParagraph[]
  onOpenSource: (paragraphIndex: number) => void
}

/**
 * 결과 화면 "쉬운 본문" 구역 (Figma 73:2264 · 문단 터치 73:2541 · 듣기 중 73:2088).
 *
 * - 원문이 있는 문단을 누르면 강조하고 "원문 보러가기" 버튼을 띄운다. 다시 누르면 닫는다
 * - 듣기: 속도를 고르고 시작하면 지금 읽는 문단 글자가 파래진다. 읽는 중에 정지를 누르면 멈추고 알림을 띄운다
 */
export function EasyBody({ id, paragraphs, onOpenSource }: EasyBodyProps) {
  const titleId = useId()
  const showToast = useToast()
  const speech = useParagraphSpeech(paragraphs)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [listeningOpen, setListeningOpen] = useState(false)
  const [speed, setSpeed] = useState<ListeningSpeed>('normal')
  // Figma: 소제목 있는 문서는 문단 사이 14px, 없는 문서는 8px
  const hasTitles = paragraphs.some((paragraph) => paragraph.title)

  function openSource(index: number) {
    if (speech.isReading) speech.stop()
    onOpenSource(index)
  }

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="flex flex-col gap-5 px-5"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h2 id={titleId} className="text-title-semibold text-blue-500">
            쉬운 본문
          </h2>
          {speech.supported && (
            <ListeningPopover
              open={listeningOpen}
              onOpenChange={(nextOpen) => {
                // 읽는 중(정지 버튼)에 누르면 패널 대신 멈춘다
                if (speech.isReading && nextOpen) {
                  speech.stop()
                  showToast('듣기를 중단했어요')
                  return
                }
                setListeningOpen(nextOpen)
              }}
              trigger={<ListenButton playing={speech.isReading} />}
              speed={speed}
              onSpeedChange={setSpeed}
              onStart={() => {
                setListeningOpen(false)
                speech.start(speed)
              }}
            />
          )}
        </div>
        <p className="text-body-regular text-gray-500">
          문단을 터치하면 원문을 확인할 수 있어요.
        </p>
      </div>

      <div className={cn('flex flex-col', hasTitles ? 'gap-3.5' : 'gap-2')}>
        {paragraphs.map((paragraph, index) => (
          <ParagraphItem
            // 문단은 순서가 바뀌지 않고 같은 문장이 두 번 나올 수 있어 순서를 키로 쓴다
            key={index}
            paragraph={paragraph}
            label={paragraph.title ?? `${index + 1}번째 문단`}
            selected={selectedIndex === index}
            reading={speech.readingIndex === index}
            onToggle={() =>
              setSelectedIndex((current) => (current === index ? null : index))
            }
            onOpenSource={() => openSource(index)}
          />
        ))}
      </div>
    </section>
  )
}

interface ParagraphItemProps {
  paragraph: ResultParagraph
  /** 스크린리더가 읽는 문단 이름 (소제목, 없으면 몇 번째 문단) */
  label: string
  selected: boolean
  reading: boolean
  onToggle: () => void
  onOpenSource: () => void
}

function ParagraphItem({
  paragraph,
  label,
  selected,
  reading,
  onToggle,
  onOpenSource,
}: ParagraphItemProps) {
  const sourceButtonId = useId()
  // 선택: Blue/600 · Medium (Figma 73:2677), 읽는 중: Blue/500 (Figma 73:2088)
  const textClassName = cn(
    selected && 'text-blue-600',
    !selected && reading && 'text-blue-500',
  )

  const content = paragraph.title ? (
    <EasyParagraph
      title={paragraph.title}
      className={cn(textClassName, selected && '[&>p]:text-body-medium')}
    >
      {paragraph.body}
    </EasyParagraph>
  ) : (
    <p
      className={cn(
        'text-body-regular whitespace-pre-line text-gray-900',
        selected && 'text-body-medium',
        textClassName,
      )}
    >
      {paragraph.body}
    </p>
  )

  if (!paragraph.source) return content

  return (
    <div className="relative">
      {/* 테두리 1px + 좌우 6px · 위아래 4px 여백만큼 밖으로 늘려, 강조해도 글자 위치가 그대로다 */}
      <div
        className={cn(
          '-mx-[7px] -my-[5px] rounded-lg border px-1.5 py-1',
          selected ? 'border-blue-400 bg-blue-90' : 'border-transparent',
        )}
      >
        {content}
      </div>
      <button
        type="button"
        aria-label={`${label} 선택`}
        aria-expanded={selected}
        aria-controls={selected ? sourceButtonId : undefined}
        onClick={onToggle}
        className="absolute -inset-x-[7px] -inset-y-[5px] rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      />
      {selected && (
        <Button
          id={sourceButtonId}
          onClick={onOpenSource}
          className="absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded-lg bg-blue-500 px-3 py-1.5 text-body-semibold whitespace-nowrap text-white select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600"
        >
          원문 보러가기
        </Button>
      )}
    </div>
  )
}
