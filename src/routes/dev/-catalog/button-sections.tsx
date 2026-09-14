import { useState } from 'react'

import CheckedSimpleIcon from '@/assets/icons/24/checked-simple.svg?react'
import DownloadIcon from '@/assets/icons/24/download.svg?react'
import CameraFilledIcon from '@/assets/icons/32/camera-filled.svg?react'
import DocumentFilledIcon from '@/assets/icons/32/document-filled.svg?react'
import ImageFilledIcon from '@/assets/icons/32/image-filled.svg?react'
import { BigFontSwitch } from '@/components/big-font-switch'
import { CtaButton } from '@/components/cta-button'
import { HomeButton, HomeSampleButton } from '@/components/home-button'
import { ListenButton } from '@/components/listen-button'
import { LoginButton } from '@/components/login-button'
import { QuickMenu } from '@/components/quick-menu'
import { RadioGroup, RadioOption } from '@/components/radio-option'

import { CatalogItem, CatalogSection } from './catalog-section'

export function CtaButtonSection() {
  return (
    <CatalogSection title="CTA" figmaNodeId="80:806">
      <CatalogItem label="primary · lg · 아이콘">
        <CtaButton>
          <CheckedSimpleIcon aria-hidden />다 찍었어요
        </CtaButton>
      </CatalogItem>
      <CatalogItem label="dark · lg · 아이콘 (TwoButtons)">
        <CtaButton variant="dark">
          <DownloadIcon aria-hidden />
          저장하기
        </CtaButton>
      </CatalogItem>
      <CatalogItem label="secondary · md + primary · md (모달 나가기 확인)">
        <div className="flex gap-2">
          <CtaButton variant="secondary" size="md">
            취소
          </CtaButton>
          <CtaButton size="md">나가기</CtaButton>
        </div>
      </CatalogItem>
      <CatalogItem label="primary · lg · disabled (Figma 에 없음)">
        <CtaButton disabled>이해했어요</CtaButton>
      </CatalogItem>
    </CatalogSection>
  )
}

export function HomeButtonSection() {
  return (
    <CatalogSection title="HomeButton" figmaNodeId="80:758">
      <CatalogItem label="primary (Default)">
        <HomeButton>
          <CameraFilledIcon aria-hidden />
          문서 촬영하기
        </HomeButton>
      </CatalogItem>
      <CatalogItem label="secondary (Default + 채우기 덮어쓰기)">
        <div className="flex flex-col gap-2.5">
          <HomeButton variant="secondary">
            <ImageFilledIcon aria-hidden />
            사진첩에서 선택하기
          </HomeButton>
          <HomeButton variant="secondary">
            <DocumentFilledIcon aria-hidden />
            파일 불러오기 (PDF)
          </HomeButton>
        </div>
      </CatalogItem>
      <CatalogItem label="Sample">
        <HomeSampleButton
          title="샘플 체험해보기"
          description="로그인 없이 기능을 체험해볼 수 있어요"
        />
      </CatalogItem>
    </CatalogSection>
  )
}

export function LoginButtonSection() {
  return (
    <CatalogSection title="Login" figmaNodeId="81:7281">
      <CatalogItem label="kakao">
        <LoginButton provider="kakao" />
      </CatalogItem>
      <CatalogItem label="google">
        <LoginButton provider="google" />
      </CatalogItem>
    </CatalogSection>
  )
}

export function ToggleSection() {
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState('빠름')

  return (
    <>
      <CatalogSection title="Listening_Button" figmaNodeId="80:923">
        <CatalogItem label="Start · Pause (눌러서 바뀜)">
          <div className="flex gap-3">
            <ListenButton playing={false} />
            <ListenButton playing />
            <ListenButton
              playing={playing}
              onClick={() => setPlaying((value) => !value)}
            />
          </div>
        </CatalogItem>
      </CatalogSection>

      <CatalogSection title="Bigfont" figmaNodeId="24:1040">
        <CatalogItem label="누르면 이 페이지 전체가 큰글씨 모드로 바뀜">
          <div>
            <BigFontSwitch />
          </div>
        </CatalogItem>
      </CatalogSection>

      <CatalogSection title="Radio_Selection" figmaNodeId="81:7547">
        <CatalogItem label={`선택: ${speed}`}>
          <RadioGroup
            aria-label="목소리 속도"
            value={speed}
            onValueChange={(value) => setSpeed(value)}
          >
            <RadioOption value="느림">느림</RadioOption>
            <RadioOption value="보통">보통</RadioOption>
            <RadioOption value="빠름">빠름</RadioOption>
          </RadioGroup>
        </CatalogItem>
      </CatalogSection>
    </>
  )
}

const quickMenuItems = [
  { value: 'easy', label: '쉬운 본문' },
  { value: 'must', label: '꼭 확인하세요' },
  { value: 'todo', label: '해야할 일' },
  { value: 'more', label: '더 알아보기' },
]

export function QuickMenuSection() {
  const [value, setValue] = useState('easy')

  return (
    <CatalogSection title="QuickMenu" figmaNodeId="156:5469 · 156:5453">
      <CatalogItem label="On · Off (눌러서 바뀜, 넘치면 가로 스크롤)">
        <QuickMenu
          items={quickMenuItems}
          value={value}
          onValueChange={setValue}
          className="-mx-5"
        />
      </CatalogItem>
    </CatalogSection>
  )
}
