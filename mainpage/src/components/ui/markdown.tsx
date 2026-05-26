import { cn } from "@/lib/utils"
import { marked } from "marked"
import { memo, useId, useMemo } from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import { CodeBlock, CodeBlockCode } from "./code-block"

export type MarkdownProps = {
  children: string
  id?: string
  className?: string
  components?: Partial<Components>
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown)
  return tokens.map((token) => token.raw)
}

function extractLanguage(className?: string): string {
  if (!className) return "plaintext"
  const match = className.match(/language-(\w+)/)
  return match ? match[1] : "plaintext"
}

const INITIAL_COMPONENTS: Partial<Components> = {
  code: function CodeComponent({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line ||
      props.node?.position?.start.line === props.node?.position?.end.line

    if (isInline) {
      return (
        <span
          className={cn(
            "bg-white/10 text-sindicato-warm-white rounded-[0.125rem] px-1 font-mono text-sm",
            className
          )}
          {...props}
        >
          {children}
        </span>
      )
    }

    const language = extractLanguage(className)

    return (
      <CodeBlock className={className}>
        <CodeBlockCode code={children as string} language={language} />
      </CodeBlock>
    )
  },
  pre: function PreComponent({ children }) {
    return <>{children}</>
  },
  p: function ParagraphComponent({ children, ...props }) {
    return (
      <p className="mb-3 last:mb-0 leading-relaxed" {...props}>
        {children}
      </p>
    )
  },
  ul: function UnorderedListComponent({ children, ...props }) {
    return (
      <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0" {...props}>
        {children}
      </ul>
    )
  },
  ol: function OrderedListComponent({ children, ...props }) {
    return (
      <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0" {...props}>
        {children}
      </ol>
    )
  },
  li: function ListItemComponent({ children, ...props }) {
    return (
      <li className="leading-relaxed" {...props}>
        {children}
      </li>
    )
  },
  table: function TableComponent({ children, ...props }) {
    return (
      <div className="mb-3 overflow-x-auto last:mb-0">
        <table className="min-w-full border-collapse text-sm" {...props}>
          {children}
        </table>
      </div>
    )
  },
  thead: function TableHeadComponent({ children, ...props }) {
    return (
      <thead className="border-b border-white/20" {...props}>
        {children}
      </thead>
    )
  },
  tbody: function TableBodyComponent({ children, ...props }) {
    return (
      <tbody {...props}>
        {children}
      </tbody>
    )
  },
  tr: function TableRowComponent({ children, ...props }) {
    return (
      <tr className="border-b border-white/10 last:border-0" {...props}>
        {children}
      </tr>
    )
  },
  th: function TableHeaderCellComponent({ children, ...props }) {
    return (
      <th className="px-3 py-2 text-left font-semibold text-sindicato-warm-white" {...props}>
        {children}
      </th>
    )
  },
  td: function TableCellComponent({ children, ...props }) {
    return (
      <td className="px-3 py-2 text-sindicato-warm-white/90" {...props}>
        {children}
      </td>
    )
  },
  h1: function H1Component({ children, ...props }) {
    return (
      <h1 className="mb-3 mt-4 text-xl font-bold first:mt-0 last:mb-0" {...props}>
        {children}
      </h1>
    )
  },
  h2: function H2Component({ children, ...props }) {
    return (
      <h2 className="mb-2 mt-4 text-lg font-bold first:mt-0 last:mb-0" {...props}>
        {children}
      </h2>
    )
  },
  h3: function H3Component({ children, ...props }) {
    return (
      <h3 className="mb-2 mt-3 text-base font-bold first:mt-0 last:mb-0" {...props}>
        {children}
      </h3>
    )
  },
  blockquote: function BlockquoteComponent({ children, ...props }) {
    return (
      <blockquote className="mb-3 border-l-2 border-white/30 pl-3 italic last:mb-0" {...props}>
        {children}
      </blockquote>
    )
  },
}

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components = INITIAL_COMPONENTS,
  }: {
    content: string
    components?: Partial<Components>
  }) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    )
  },
  function propsAreEqual(prevProps, nextProps) {
    return prevProps.content === nextProps.content
  }
)

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock"

function MarkdownComponent({
  children,
  id,
  className,
  components = INITIAL_COMPONENTS,
}: MarkdownProps) {
  const generatedId = useId()
  const blockId = id ?? generatedId
  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children])

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock
          key={`${blockId}-block-${index}`}
          content={block}
          components={components}
        />
      ))}
    </div>
  )
}

const Markdown = memo(MarkdownComponent)
Markdown.displayName = "Markdown"

export { Markdown }
