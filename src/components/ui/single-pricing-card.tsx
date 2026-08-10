import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import type { LucideIcon } from "lucide-react"
import { Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { reveal } from "@/lib/motion"

/* Оригиналът от 21st.dev е за Next.js + framer-motion. Тук е адаптиран:
   `next/link` → <a>, а анимациите минават през GSAP помощниците в
   `lib/motion` (проектът вече ползва GSAP + ScrollTrigger, втора
   анимационна библиотека не си заслужава теглото).
   Поправено е и `setCurrentTestimonialIndex` — в оригинала се вика от
   вътрешния компонент, където не е в обхват, и кодът не компилира. */

export interface Testimonial {
  id: number
  name: string
  role: string
  company?: string
  content: string
  rating: number
  avatar: string
}

export interface Feature {
  text: string
}

export interface Benefit {
  text: string
  icon: LucideIcon
}

export interface SinglePricingCardProps {
  // Заглавна част
  badge?: {
    icon: LucideIcon
    text: string
  }
  title: string
  subtitle: string

  // Цена
  price: {
    current: string
    original?: string
    discount?: string
    discountBadgeClassName?: string
    /** Допълнителен ред под цената — тук: равностойността в лева. */
    note?: string
  }

  // Предимства (лява колона)
  benefits: Benefit[]

  // Какво включва (дясна колона)
  features: Feature[]
  featuresIcon: LucideIcon
  featuresTitle?: string
  featuresBadge?: {
    icon: LucideIcon
    text: string
  }

  // Бутони
  primaryButton: {
    text: string
    icon: LucideIcon
    href?: string
    onClick?: () => void
    chevronIcon?: LucideIcon
    /** Дописва се към класовете на бутона — тук се изравнява с
        хапчевидните бутони на сайта. */
    className?: string
  }
  secondaryButton?: {
    text: string
    icon: LucideIcon
    href?: string
    onClick?: () => void
    className?: string
  }

  // Отзиви — при празен масив блокът не се рендира изобщо
  testimonials: Testimonial[]
  testimonialRotationSpeed?: number // в милисекунди

  animationEnabled?: boolean

  className?: string
  cardClassName?: string
  maxWidth?: string
}

export function SinglePricingCard({
  badge,
  title,
  subtitle,
  price,
  benefits,
  features,
  featuresIcon,
  featuresTitle = "Какво включва",
  featuresBadge,
  primaryButton,
  secondaryButton,
  testimonials,
  testimonialRotationSpeed = 5000,
  animationEnabled = true,
  className,
  cardClassName,
  maxWidth = "max-w-2xl",
}: SinglePricingCardProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)

  // Отзивите се въртят сами
  useEffect(() => {
    if (testimonials.length <= 1) return

    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }, testimonialRotationSpeed)

    return () => clearInterval(interval)
  }, [testimonials.length, testimonialRotationSpeed])

  // Entrance анимацията е същата като на останалите секции (GSAP ScrollTrigger,
  // уважава prefers-reduced-motion през помощника `reveal`).
  useEffect(() => {
    const el = sectionRef.current
    if (!el || !animationEnabled) return
    const ctx = gsap.context(() => {
      const card = el.querySelector(".spc-card")
      if (card) reveal(card, el, { y: 30, duration: 0.6 })
      const feats = el.querySelectorAll(".spc-feature")
      if (feats.length) reveal(feats, el, { y: 16, stagger: 0.05, delay: 0.25, duration: 0.5 })
    }, el)
    return () => ctx.revert()
  }, [animationEnabled])

  return (
    <div ref={sectionRef} className={cn("py-12 relative overflow-hidden", className)}>
      <div className={cn("container px-4 md:px-6 relative z-10 mx-auto", maxWidth)}>
        <SinglePricingCardContent
          badge={badge}
          title={title}
          subtitle={subtitle}
          price={price}
          benefits={benefits}
          features={features}
          featuresIcon={featuresIcon}
          featuresTitle={featuresTitle}
          featuresBadge={featuresBadge}
          primaryButton={primaryButton}
          secondaryButton={secondaryButton}
          testimonials={testimonials}
          currentTestimonialIndex={currentTestimonialIndex}
          onSelectTestimonial={setCurrentTestimonialIndex}
          animationEnabled={animationEnabled}
          cardClassName={cardClassName}
        />
      </div>
    </div>
  )
}

interface SinglePricingCardContentProps
  extends Omit<SinglePricingCardProps, "className" | "maxWidth" | "testimonialRotationSpeed"> {
  currentTestimonialIndex: number
  onSelectTestimonial: (index: number) => void
  cardClassName?: string
}

function SinglePricingCardContent({
  badge,
  title,
  subtitle,
  price,
  benefits,
  features,
  featuresIcon,
  featuresTitle,
  featuresBadge,
  primaryButton,
  secondaryButton,
  testimonials,
  currentTestimonialIndex,
  onSelectTestimonial,
  animationEnabled,
  cardClassName,
}: SinglePricingCardContentProps) {
  const BadgeIcon = badge?.icon
  const FeaturesBadgeIcon = featuresBadge?.icon
  const FeaturesIcon = featuresIcon
  const PrimaryButtonIcon = primaryButton.icon
  const ChevronIcon = primaryButton.chevronIcon
  const SecondaryButtonIcon = secondaryButton?.icon

  return (
    <Card className={cn("spc-card overflow-hidden border border-primary/10 relative group", cardClassName)}>
      {animationEnabled && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent" />
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        {/* Лява колона — цена */}
        <div className="p-6 md:p-8 md:w-1/2 flex flex-col">
          {badge && (
            <div className="flex items-center mb-4">
              <Badge className="px-3 py-1 bg-primary/5 border-primary/10 text-primary hover:bg-primary/10">
                {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5 mr-1" />}
                <span>{badge.text}</span>
              </Badge>
            </div>
          )}

          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{subtitle}</p>

          <div className="flex items-baseline flex-wrap gap-y-2 mb-1">
            <span className="text-4xl font-bold">{price.current}</span>
            {price.original && <span className="text-muted-foreground ml-2 line-through">{price.original}</span>}
            {price.discount && (
              <Badge
                variant="outline"
                className={cn("ml-3 border-green-400/30 text-green-500", price.discountBadgeClassName)}
              >
                <span>{price.discount}</span>
              </Badge>
            )}
          </div>
          {price.note && <p className="text-sm text-muted-foreground mb-6">{price.note}</p>}

          <div className="space-y-4 mb-6">
            {benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon

              return (
                <div key={index} className="flex items-center gap-2">
                  <BenefitIcon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">{benefit.text}</span>
                </div>
              )
            })}
          </div>

          <div className="mt-auto space-y-3">
            <Button
              className={cn("w-full gap-2 group", primaryButton.className)}
              size="lg"
              onClick={primaryButton.onClick}
              asChild={!!primaryButton.href}
            >
              {primaryButton.href ? (
                <a href={primaryButton.href}>
                  <PrimaryButtonIcon className="h-4 w-4" />
                  <span>{primaryButton.text}</span>
                  {ChevronIcon && (
                    <ChevronIcon className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-1" />
                  )}
                </a>
              ) : (
                <>
                  <PrimaryButtonIcon className="h-4 w-4" />
                  <span>{primaryButton.text}</span>
                  {ChevronIcon && (
                    <ChevronIcon className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-1" />
                  )}
                </>
              )}
            </Button>

            {secondaryButton && SecondaryButtonIcon && (
              <Button
                variant="outline"
                className={cn("w-full gap-2", secondaryButton.className)}
                size="lg"
                onClick={secondaryButton.onClick}
                asChild={!!secondaryButton.href}
              >
                {secondaryButton.href ? (
                  <a href={secondaryButton.href} target="_blank" rel="noreferrer">
                    <span>{secondaryButton.text}</span>
                    <SecondaryButtonIcon className="h-4 w-4 ml-auto" />
                  </a>
                ) : (
                  <>
                    <span>{secondaryButton.text}</span>
                    <SecondaryButtonIcon className="h-4 w-4 ml-auto" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Дясна колона — какво включва */}
        <div className="p-6 md:p-8 md:w-1/2 md:border-l border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <h4 className="font-semibold">{featuresTitle}</h4>
            {featuresBadge && (
              <Badge variant="outline" className="ml-auto border-primary/20 text-primary">
                {FeaturesBadgeIcon && <FeaturesBadgeIcon className="h-3 w-3 mr-1" />}
                <span>{featuresBadge.text}</span>
              </Badge>
            )}
          </div>

          <div className="space-y-3 mb-6">
            {features.map((feature, i) => (
              <div key={i} className="spc-feature flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <FeaturesIcon className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>

          {testimonials.length > 0 && (
            <>
              <Separator className="my-6" />

              <div className="rounded-lg border border-border/50 relative overflow-hidden min-h-[140px]">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    aria-hidden={index !== currentTestimonialIndex}
                    className={cn(
                      "absolute inset-0 p-4 transition-all duration-500",
                      index === currentTestimonialIndex
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-3 pointer-events-none",
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full overflow-hidden shrink-0">
                        <img
                          src={testimonial.avatar}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.role}
                          {testimonial.company && `, ${testimonial.company}`}
                        </p>
                      </div>
                      <div className="ml-auto flex" aria-label={`${testimonial.rating} от 5`}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm italic">{testimonial.content}</p>
                  </div>
                ))}
              </div>

              {testimonials.length > 1 && (
                <div className="flex justify-center mt-4 gap-1">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        index === currentTestimonialIndex ? "w-4 bg-primary" : "w-1.5 bg-primary/30",
                      )}
                      onClick={() => onSelectTestimonial(index)}
                      aria-label={`Отзив ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
