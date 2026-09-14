import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type ChangeEvent, useEffect, useRef, useState } from 'react'

import type { SampleId } from '@/api/samples'
import CameraFilledIcon from '@/assets/icons/32/camera-filled.svg?react'
import DocumentFilledIcon from '@/assets/icons/32/document-filled.svg?react'
import ImageFilledIcon from '@/assets/icons/32/image-filled.svg?react'
import homeDocumentsImage from '@/assets/images/home-documents.jpg'
import privacyShieldImage from '@/assets/images/privacy-shield.png'
import { Divider } from '@/components/divider'
import { HomeGnb } from '@/components/gnb'
import { HomeButton, HomeSampleButton } from '@/components/home-button'
import { Modal, ModalClose, ModalTextButton } from '@/components/modal'
import { type LoginProvider, useAuth } from '@/hooks/useAuth'
import { startConversionSession } from '@/hooks/useConversionSession'
import {
  clearDocumentDraft,
  DraftError,
  type ImageSource,
  startImageDraft,
  startPdfDraft,
} from '@/hooks/useDocumentDraft'
import { usePrivacyNotice } from '@/hooks/usePrivacyNotice'
import { useToast } from '@/hooks/useToast'

import { LoginSheet } from './-auth/login-sheet'
import { DocumentTypesSheet } from './-home/document-types-sheet'
import { SampleSheet } from './-home/sample-sheet'

export const Route = createFileRoute('/')({
  component: HomePage,
})

/** 문서를 넣는 방법. 홈의 큰 버튼 세 개와 짝이다 */
type InputMethod = 'camera' | 'gallery' | 'file'

/** 문서를 넣기 전에 차례로 띄우는 안내: 개인정보 안내 모달 → 로그인 유도 시트(비로그인일 때) → 지원 문서 시트 */
type GuideStep = 'privacy' | 'login' | 'documentTypes'

function HomePage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const { isLoggedIn, login } = useAuth()
  const privacyNotice = usePrivacyNotice()
  const [inputMethod, setInputMethod] = useState<InputMethod>('camera')
  const [guideStep, setGuideStep] = useState<GuideStep | null>(null)
  const [sampleSheetOpen, setSampleSheetOpen] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 홈으로 돌아오면 고르던 사진 · 파일을 메모리에서 비운다 (개인정보)
  useEffect(() => {
    clearDocumentDraft()
  }, [])

  function startInput(method: InputMethod) {
    setInputMethod(method)
    if (!privacyNotice.isDismissed) setGuideStep('privacy')
    else setGuideStep(isLoggedIn ? 'documentTypes' : 'login')
  }

  // 안내 창을 바깥 누르기 · 쓸어내리기로 닫으면 문서 넣기를 그만둔다.
  // 버튼으로 다음 안내로 넘어갔다면 단계가 이미 바뀌어 있으니 그대로 둔다
  function closeGuide(step: GuideStep) {
    setGuideStep((current) => (current === step ? null : current))
  }

  function handlePrivacyConfirm() {
    setGuideStep(isLoggedIn ? 'documentTypes' : 'login')
  }

  function handleLogin(provider: LoginProvider) {
    login(provider)
    setGuideStep('documentTypes')
  }

  function handleDocumentTypesConfirm() {
    setGuideStep(null)
    // 카메라 · 파일 선택 창은 사용자가 누른 순간에만 열 수 있어서, 이 클릭 처리 안에서 바로 연다
    if (inputMethod === 'camera') cameraInputRef.current?.click()
    else if (inputMethod === 'gallery') galleryInputRef.current?.click()
    else fileInputRef.current?.click()
  }

  function readSelectedFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    // 같은 파일을 다시 골라도 onChange 가 오도록 비운다
    event.target.value = ''
    return files
  }

  function showDraftError(error: unknown) {
    showToast(
      error instanceof DraftError
        ? error.message
        : '사진을 불러오지 못했어요. 다시 시도해주세요',
    )
  }

  async function handleImagesChange(
    source: ImageSource,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = readSelectedFiles(event)
    if (files.length === 0) return
    try {
      const { truncated } = await startImageDraft(source, files)
      if (truncated) showToast('사진은 10장까지 올릴 수 있어요')
      navigate({ to: '/review' })
    } catch (error) {
      showDraftError(error)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const [file] = readSelectedFiles(event)
    if (!file) return
    try {
      startPdfDraft(file)
      // 파일은 확인 화면 없이 바로 변환을 시작한다
      startConversionSession([file])
      navigate({ to: '/result' })
    } catch (error) {
      showDraftError(error)
    }
  }

  function handleSampleSelect(sampleId: SampleId) {
    setSampleSheetOpen(false)
    navigate({ to: '/samples/$sampleId', params: { sampleId } })
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-gradient-background pt-[env(safe-area-inset-top)] pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))]">
      {/*
       * Figma 에서 제목 · 버튼 뒤에 깔린 일러스트. 흰 바탕을 곱하기로 지워 배경 그라디언트에 섞는다.
       * 원본 가장자리가 순백이 아니라(253~254) 네모 경계가 비치므로, 가장자리 5% 를 투명하게 흐린다
       */}
      <img
        src={homeDocumentsImage}
        alt=""
        className="pointer-events-none absolute top-[calc(env(safe-area-inset-top)+158px)] -right-5 h-[275px] w-[330px] opacity-78 mix-blend-multiply mask-x-from-95% mask-y-from-95%"
      />

      <HomeGnb
        className="relative"
        onSettingsClick={() => navigate({ to: '/settings' })}
      />

      <main className="relative flex flex-1 flex-col px-5">
        <div className="flex flex-col gap-[15px] pt-2.5">
          <h1 className="text-headline-l-semibold whitespace-pre-line text-gray-900">
            {'어려운 문서,\n이제 쉽게 읽어보아요!'}
          </h1>
          <p className="text-subtitle-semibold whitespace-pre-line text-gray-500">
            {
              '복잡한 글을 알아보기 쉬운 말로 바꾸고,\n중요한 정보를 정리해드려요.'
            }
          </p>
        </div>

        {/* 화면이 길면 버튼을 아래에 붙이고, 짧아도 일러스트가 보일 틈(40px)은 남긴다 */}
        <div className="mt-auto flex flex-col gap-3 pt-10">
          <div className="flex flex-col gap-2.5">
            <HomeButton onClick={() => startInput('camera')}>
              <CameraFilledIcon aria-hidden />
              문서 촬영하기
            </HomeButton>
            <HomeButton
              variant="secondary"
              onClick={() => startInput('gallery')}
            >
              <ImageFilledIcon aria-hidden />
              사진첩에서 선택하기
            </HomeButton>
            <HomeButton variant="secondary" onClick={() => startInput('file')}>
              <DocumentFilledIcon aria-hidden />
              파일 불러오기 (PDF)
            </HomeButton>
          </div>

          <div className="flex items-center">
            <Divider className="w-auto flex-1" />
            <span className="p-2.5 text-caption-l-semibold text-gray-200">
              또는
            </span>
            <Divider className="w-auto flex-1" />
          </div>

          <HomeSampleButton
            title="샘플 체험해보기"
            description="로그인 없이 기능을 체험해볼 수 있어요"
            onClick={() => setSampleSheetOpen(true)}
          />
        </div>
      </main>

      {/* 휴대폰 기본 카메라를 연다 (웹 카메라 화면 대신, docs/product.md "문서 입력") */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(event) => handleImagesChange('camera', event)}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => handleImagesChange('gallery', event)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={handleFileChange}
      />

      <Modal
        open={guideStep === 'privacy'}
        onOpenChange={(open) => !open && closeGuide('privacy')}
        illustration={privacyShieldImage}
        title={'문서 속에 개인정보가\n있어도 안심하세요'}
        description={
          '문서 속 개인정보는\n쉬운 글 변환에만 사용하며,\n변환이 끝나면 저장하지 않아요.'
        }
      >
        <ModalClose onClick={handlePrivacyConfirm}>확인</ModalClose>
        {/* Figma 는 "다시 안보지 않기" 지만 오타라 고쳐 쓴다 (docs/product.md) */}
        <ModalTextButton
          onClick={() => {
            privacyNotice.dismiss()
            handlePrivacyConfirm()
          }}
        >
          다시 보지 않기
        </ModalTextButton>
      </Modal>
      <LoginSheet
        open={guideStep === 'login'}
        onOpenChange={(open) => !open && closeGuide('login')}
        onLogin={handleLogin}
      />
      <DocumentTypesSheet
        open={guideStep === 'documentTypes'}
        onOpenChange={(open) => !open && closeGuide('documentTypes')}
        onConfirm={handleDocumentTypesConfirm}
      />
      <SampleSheet
        open={sampleSheetOpen}
        onOpenChange={setSampleSheetOpen}
        onSelect={handleSampleSelect}
      />
    </div>
  )
}
