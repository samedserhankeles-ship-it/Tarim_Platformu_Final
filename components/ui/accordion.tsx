"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

const Accordion = ({
  children,
  type = "single",
  collapsible = false,
  className,
  ...props
}: {
  children: React.ReactNode
  type?: "single" | "multiple"
  collapsible?: boolean
  className?: string
}) => {
  const [value, setValue] = React.useState<string>("")

  const onValueChange = (newValue: string) => {
    setValue(newValue === value && collapsible ? "" : newValue)
  }

  return (
    <AccordionContext.Provider value={{ value, onValueChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => (
  <div ref={ref} className={cn("border-b", className)} data-value={value} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { value, onValueChange } = React.useContext(AccordionContext)
  // Parent item'ın value'sunu bulmak için basit bir hack yapamıyoruz çünkü context item içinde değil.
  // Bu yüzden AccordionItem'a value prop'u geçiyoruz ama buraya nasıl alacağız?
  // Radix UI context yapısı karmaşıktır. Basit çözüm:
  // AccordionItem componentinde child'lara value pass etmek veya context kullanmak.
  
  // Basit implementasyon için bu component'in parent'ını bilmesi gerek.
  // O yüzden AccordionItemContext yapalım.
  return null; 
})

// Basitleştirilmiş versiyon (Context olmadan zor, o yüzden context'i item içine taşıyalım)

const AccordionItemContext = React.createContext<{
  value: string
  isOpen: boolean
  toggle: () => void
}>({ value: "", isOpen: false, toggle: () => {} })


const SimpleAccordion = ({
  children,
  className,
  collapsible, // Destructure collapsible to exclude it from ...props
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { type?: "single" | "multiple", collapsible?: boolean }) => {
    // Çoklu seçim desteği olmadan basit tekli accordion (şimdilik)
    const [openItem, setOpenItem] = React.useState<string>("");

    return (
        <div className={className} {...props}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                        openItem,
                        setOpenItem
                    });
                }
                return child;
            })}
        </div>
    )
}

const SimpleAccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string, openItem?: string, setOpenItem?: (v: string) => void }
>(({ className, value, openItem, setOpenItem, children, ...props }, ref) => {
    const isOpen = openItem === value;
    const toggle = () => setOpenItem && setOpenItem(isOpen ? "" : value);

    return (
        <AccordionItemContext.Provider value={{ value, isOpen, toggle }}>
            <div ref={ref} className={cn("border-b", className)} {...props}>
                {children}
            </div>
        </AccordionItemContext.Provider>
    )
})
SimpleAccordionItem.displayName = "AccordionItem"

const SimpleAccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { isOpen, toggle } = React.useContext(AccordionItemContext);
    return (
        <div className="flex">
            <button
                ref={ref}
                onClick={toggle}
                className={cn(
                    "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
                    isOpen && "[&>svg]:rotate-180",
                    className
                )}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </button>
        </div>
    )
})
SimpleAccordionTrigger.displayName = "AccordionTrigger"

const SimpleAccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { isOpen } = React.useContext(AccordionItemContext);
    if (!isOpen) return null;

    return (
        <div
            ref={ref}
            className="overflow-hidden text-sm transition-all animate-in slide-in-from-top-1"
            {...props}
        >
            <div className={cn("pb-4 pt-0", className)}>{children}</div>
        </div>
    )
})
SimpleAccordionContent.displayName = "AccordionContent"

export { SimpleAccordion as Accordion, SimpleAccordionItem as AccordionItem, SimpleAccordionTrigger as AccordionTrigger, SimpleAccordionContent as AccordionContent }