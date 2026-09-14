import { createFileRoute, notFound } from '@tanstack/react-router'

import { BigFontSwitch } from '@/components/big-font-switch'

import {
  CtaButtonSection,
  HomeButtonSection,
  LoginButtonSection,
  QuickMenuSection,
  ToggleSection,
} from './-catalog/button-sections'
import {
  DividerSection,
  DocumentChipSection,
  DocumentListSection,
  FaqSection,
  InfoListSection,
  ToastSection,
} from './-catalog/display-sections'
import { IconSection } from './-catalog/icon-section'
import {
  BottomSheetSection,
  GnbSection,
  ListeningSection,
  ModalSection,
} from './-catalog/overlay-sections'
import {
  EasyParagraphSection,
  MustCardSection,
  ResultHeroSection,
} from './-catalog/result-sections'

/**
 * 컴포넌트 카탈로그 (개발 모드 전용).
 * 옮긴 공용 컴포넌트를 Figma Component 섹션과 나란히 비교하는 곳이다.
 * 새 컴포넌트를 만들면 `-catalog/` 에 모든 variant 를 추가한다.
 */
export const Route = createFileRoute('/dev/components')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound()
  },
  component: ComponentCatalogPage,
})

function ComponentCatalogPage() {
  return (
    <div className="min-h-dvh bg-gray-90">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-3">
        <h1 className="text-title-semibold text-gray-900">컴포넌트 카탈로그</h1>
        <BigFontSwitch />
      </header>

      <main className="mx-auto flex max-w-[393px] flex-col gap-3 py-3">
        <CtaButtonSection />
        <HomeButtonSection />
        <LoginButtonSection />
        <ToggleSection />
        <QuickMenuSection />
        <DividerSection />
        <DocumentChipSection />
        <ToastSection />
        <InfoListSection />
        <DocumentListSection />
        <FaqSection />
        <ModalSection />
        <BottomSheetSection />
        <ListeningSection />
        <GnbSection />
        <ResultHeroSection />
        <EasyParagraphSection />
        <MustCardSection />
        <IconSection />
      </main>
    </div>
  )
}
