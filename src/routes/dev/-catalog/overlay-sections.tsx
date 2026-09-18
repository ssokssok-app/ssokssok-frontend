import { useState } from 'react'

import ArrowBackIosIcon from '@/assets/icons/24/arrow-back-ios.svg?react'
import CloseIcon from '@/assets/icons/24/close.svg?react'
import FlashOnIcon from '@/assets/icons/24/flash-on.svg?react'
import HomeIcon from '@/assets/icons/24/home.svg?react'
import privacyShieldImage from '@/assets/images/privacy-shield.png'
import warningImage from '@/assets/images/warning.png'
import {
  BottomSheet,
  BottomSheetDescription,
  BottomSheetTitle,
} from '@/components/bottom-sheet'
import { CtaButton } from '@/components/cta-button'
import { DocumentListItem } from '@/components/document-list-item'
import { Gnb, GnbIconButton, HomeGnb } from '@/components/gnb'
import { ListenButton } from '@/components/listen-button'
import {
  type ListeningSpeed,
  ListeningPopover,
} from '@/components/listening-popover'
import {
  ConfirmModal,
  Modal,
  ModalClose,
  ModalTextButton,
} from '@/components/modal'
import { useToast } from '@/hooks/useToast'

import { CatalogItem, CatalogSection } from './catalog-section'

export function ModalSection() {
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const showToast = useToast()

  return (
    <CatalogSection title="Modal" figmaNodeId="156:5765">
      <CatalogItem label="Safety (Modal) · Exit (ConfirmModal)">
        <div className="flex gap-2">
          <CtaButton size="md" onClick={() => setPrivacyOpen(true)}>
            개인정보 안내
          </CtaButton>
          <CtaButton size="md" variant="dark" onClick={() => setExitOpen(true)}>
            나가기 확인
          </CtaButton>
        </div>
      </CatalogItem>

      <Modal
        open={privacyOpen}
        onOpenChange={setPrivacyOpen}
        illustration={privacyShieldImage}
        title={'문서 속에 개인정보가\n있어도 안심하세요'}
        description={
          '문서 속 개인정보는\n쉬운 글 변환에만 사용하며,\n변환이 끝나면 저장하지 않아요.'
        }
      >
        <ModalClose>확인</ModalClose>
        {/* Figma 는 "다시 안보지 않기" 지만 오타라 고쳐 쓴다 (docs/product.md) */}
        <ModalTextButton
          onClick={() => {
            setPrivacyOpen(false)
            showToast('다시 보지 않기를 눌렀어요')
          }}
        >
          다시 보지 않기
        </ModalTextButton>
      </Modal>

      <ConfirmModal
        open={exitOpen}
        onOpenChange={setExitOpen}
        illustration={warningImage}
        title="정말 나가시겠어요?"
        description={
          '이 결과는 따로 저장되지 않아요.\n지금 나가면 다시 볼 수 없어요.'
        }
        confirmLabel="나가기"
        onConfirm={() => {
          setExitOpen(false)
          showToast('나가기를 눌렀어요')
        }}
      />
    </CatalogSection>
  )
}

export function BottomSheetSection() {
  const [openSheet, setOpenSheet] = useState<'center' | 'list' | null>(null)
  const showToast = useToast()

  function close(open: boolean) {
    if (!open) setOpenSheet(null)
  }

  return (
    <CatalogSection title="BottomSheet" figmaNodeId="홈 시트 70:1309 · 66:940">
      <CatalogItem label="Figma 컴포넌트는 없음. 쓸어내리거나 바깥을 누르면 닫힘">
        <div className="flex gap-2">
          <CtaButton size="md" onClick={() => setOpenSheet('center')}>
            가운데 제목
          </CtaButton>
          <CtaButton
            size="md"
            variant="dark"
            onClick={() => setOpenSheet('list')}
          >
            제목 + 목록
          </CtaButton>
        </div>
      </CatalogItem>

      <BottomSheet
        open={openSheet === 'center'}
        onOpenChange={close}
        className="gap-[46px] pt-[45px] pb-[26px]"
      >
        <BottomSheetTitle className="text-center text-headline-m-semibold">
          {'로그인하고 더 많은 문서를\n쉽게 읽어보세요'}
        </BottomSheetTitle>
        <CtaButton onClick={() => setOpenSheet(null)}>닫기</CtaButton>
      </BottomSheet>

      <BottomSheet
        open={openSheet === 'list'}
        onOpenChange={close}
        className="pt-[22px] pb-[50px]"
      >
        <div className="flex flex-col gap-0.5">
          <BottomSheetTitle>샘플 체험해보기</BottomSheetTitle>
          <BottomSheetDescription>
            사용해보고 싶은 문서를 선택해주세요
          </BottomSheetDescription>
        </div>
        <div className="mt-[22px] flex flex-col gap-2">
          <DocumentListItem onClick={() => showToast('근로 계약서를 눌렀어요')}>
            근로 계약서
          </DocumentListItem>
          <DocumentListItem
            onClick={() => showToast('임대차 계약서를 눌렀어요')}
          >
            임대차 계약서
          </DocumentListItem>
        </div>
      </BottomSheet>
    </CatalogSection>
  )
}

export function ListeningSection() {
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<ListeningSpeed>('fast')
  const showToast = useToast()

  return (
    <CatalogSection title="Listening" figmaNodeId="81:7538">
      <CatalogItem label="듣기 → 패널 → 듣기 시작 → 정지 (누르면 멈춤)">
        <div className="flex items-center justify-between">
          <span className="text-title-semibold text-gray-900">쉬운 본문</span>
          <ListeningPopover
            open={open}
            onOpenChange={(nextOpen) => {
              // 읽는 중에 누르면 패널 대신 멈춘다
              if (playing && nextOpen) {
                setPlaying(false)
                showToast('듣기를 중단했어요')
                return
              }
              setOpen(nextOpen)
            }}
            trigger={<ListenButton playing={playing} />}
            speed={speed}
            onSpeedChange={setSpeed}
            onStart={() => {
              setOpen(false)
              setPlaying(true)
            }}
          />
        </div>
      </CatalogItem>
    </CatalogSection>
  )
}

export function GnbSection() {
  return (
    <CatalogSection title="GNB" figmaNodeId="94:2720">
      <CatalogItem label="Default · light (카메라, 검정 배경)">
        <Gnb
          tone="light"
          className="-mx-5 bg-black"
          left={<GnbIconButton label="뒤로 가기" icon={ArrowBackIosIcon} />}
          right={<GnbIconButton label="플래시" icon={FlashOnIcon} />}
        />
      </CatalogItem>
      <CatalogItem label="Default · dark (촬영한 문서 확인 · 설정, 흰 배경)">
        <Gnb
          tone="dark"
          title="촬영한 문서 확인"
          className="-mx-5 border-y border-gray-90"
          left={<GnbIconButton label="뒤로 가기" icon={ArrowBackIosIcon} />}
        />
      </CatalogItem>
      <CatalogItem label="Variant2 · light (문서 인식 결과, 파란 배경은 예시)">
        <Gnb
          tone="light"
          title="문서 인식 결과"
          className="-mx-5 bg-blue-500"
          left={<GnbIconButton label="홈으로" icon={HomeIcon} />}
          right={<GnbIconButton label="닫기" icon={CloseIcon} />}
        />
      </CatalogItem>
      <CatalogItem label="Home · Home_BIg (큰글씨를 켜면 설정 아이콘이 커짐)">
        <HomeGnb
          className="-mx-5 bg-gradient-background"
          settingsMenuItems={[]}
        />
      </CatalogItem>
    </CatalogSection>
  )
}

export function MenuSection() {
  const showToast = useToast()

  return (
    <CatalogSection title="Menu" figmaNodeId="251:3217">
      <CatalogItem label="홈 설정 아이콘을 누르면 뜨는 메뉴 (Figma 설정 2 251:3114)">
        <HomeGnb
          className="-mx-5 bg-gradient-background"
          settingsMenuItems={[
            {
              label: '1:1 문의',
              onSelect: () => showToast('1:1 문의를 눌렀어요'),
            },
            {
              label: '개인정보처리방침',
              onSelect: () => showToast('개인정보처리방침을 눌렀어요'),
            },
          ]}
        />
      </CatalogItem>
    </CatalogSection>
  )
}
