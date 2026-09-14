import { type RefObject, useEffect, useRef, useState } from 'react'

// 바로가기를 누른 뒤 부드럽게 스크롤하는 동안에는 지나가는 구역으로 선택이 흔들리지 않게 잠시 고정한다
const CLICK_LOCK_MS = 1000

interface SectionScrollOptions<T extends string> {
  /** 위에서부터 순서대로. 요소 id 는 sectionElementId(값) 이다 */
  sections: readonly T[]
  headerRef: RefObject<HTMLElement | null>
  menuRef: RefObject<HTMLElement | null>
}

export function sectionElementId(section: string) {
  return `result-${section}`
}

/**
 * 결과 화면 바로가기 메뉴와 스크롤을 잇는다 (Figma "스크롤할 때나 메뉴 터치 시 상단 메뉴 이렇게 챡 붙여줘!").
 *
 * - activeSection: 메뉴 아래 선을 지나 올라간 마지막 구역. 페이지 끝에 닿으면 마지막 구역
 * - menuStuck: 메뉴가 헤더 밑에 붙었는지 (붙으면 그림자를 준다)
 * - scrollToSection: 헤더와 메뉴에 가리지 않게 구역을 메뉴 바로 아래로 옮긴다
 */
export function useSectionScroll<T extends string>({
  sections,
  headerRef,
  menuRef,
}: SectionScrollOptions<T>) {
  const [activeSection, setActiveSection] = useState<T>(sections[0])
  const [menuStuck, setMenuStuck] = useState(false)
  const clickLockRef = useRef<{ section: T; until: number } | null>(null)

  useEffect(() => {
    let frame = 0

    function update() {
      frame = 0
      const header = headerRef.current
      const menu = menuRef.current
      if (!header || !menu) return

      const headerHeight = header.offsetHeight
      setMenuStuck(menu.getBoundingClientRect().top <= headerHeight + 0.5)

      const lock = clickLockRef.current
      if (lock && Date.now() < lock.until) {
        setActiveSection(lock.section)
        return
      }
      clickLockRef.current = null

      const line = headerHeight + menu.offsetHeight + 8
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      let current = sections[0]
      for (const section of sections) {
        const element = document.getElementById(sectionElementId(section))
        if (element && element.getBoundingClientRect().top <= line) {
          current = section
        }
      }
      setActiveSection(atBottom ? sections[sections.length - 1] : current)
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [sections, headerRef, menuRef])

  function scrollToSection(section: T) {
    const element = document.getElementById(sectionElementId(section))
    const header = headerRef.current
    const menu = menuRef.current
    if (!element || !header || !menu) return

    const offset = header.offsetHeight + menu.offsetHeight
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    clickLockRef.current = { section, until: Date.now() + CLICK_LOCK_MS }
    setActiveSection(section)
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY - offset,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  return { activeSection, menuStuck, scrollToSection }
}
