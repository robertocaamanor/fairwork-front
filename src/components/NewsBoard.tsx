import { useRef, useState } from 'react'
import { CATEGORY_LABELS } from '../constants/categories'
import type { NewsCategory, NewsItem, NewsFilter } from '../types/news'
import { NewsColumnContainer } from './NewsColumnContainer'

interface NewsBoardProps {
  categories: NewsCategory[]
  onSendToN8n: (id: string) => Promise<unknown>
  sendingToN8nItemId?: string
  searchByCategory: Record<NewsCategory, string>
  debouncedSearchByCategory: Record<NewsCategory, string>
  onSearchChange: (category: NewsCategory, value: string) => void
  onSearchDebounced: (category: NewsCategory, value: string) => void
  onOpenRelated: (item: NewsItem) => void
  selectedNewsIds: Set<string>
  onToggleSelection: (id: string) => void
  visibleCategories: Set<NewsCategory>
  onReorderCategory: (source: NewsCategory, target: NewsCategory) => void
  topPaddingClass?: string
  filter: NewsFilter
  canSendToN8n: boolean
}

export function NewsBoard({
  categories,
  onSendToN8n,
  sendingToN8nItemId,
  searchByCategory,
  debouncedSearchByCategory,
  onSearchChange,
  onSearchDebounced,
  onOpenRelated,
  selectedNewsIds,
  onToggleSelection,
  visibleCategories,
  onReorderCategory,
  topPaddingClass = 'pt-24',
  filter,
  canSendToN8n,
}: NewsBoardProps) {
  const visibleCategoryList = categories.filter(c => visibleCategories.has(c))
  
  const scrollRef = useRef<HTMLElement>(null)
  const [isDraggingScroll, setIsDraggingScroll] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const [draggedCategory, setDraggedCategory] = useState<NewsCategory | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDraggingScroll(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDraggingScroll(false)
  }

  const handleMouseUp = () => {
    setIsDraggingScroll(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingScroll || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5 // Scroll speed
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <main 
      ref={scrollRef}
      className={`h-full overflow-x-auto overflow-y-hidden px-4 pb-4 ${topPaddingClass} sm:px-6 select-none`}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div className="flex h-full min-w-max gap-4 items-start">
        {visibleCategoryList.map((category) => (
          <div
            key={category}
            draggable
            onDragStart={(e) => {
              setDraggedCategory(category)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={(e) => {
              e.preventDefault()
              if (draggedCategory && draggedCategory !== category) {
                onReorderCategory(draggedCategory, category)
              }
              setDraggedCategory(null)
            }}
            onDragEnd={() => setDraggedCategory(null)}
            className={`cursor-grab active:cursor-grabbing transition-transform ${draggedCategory === category ? 'opacity-50 scale-95' : ''}`}
            onMouseDown={(e) => e.stopPropagation()} // Prevent pan scroll when clicking on column
          >
            <NewsColumnContainer
              category={category}
              filter={filter}
              searchValue={searchByCategory[category]}
              debouncedSearch={debouncedSearchByCategory[category]}
              onSendToN8n={onSendToN8n}
              sendingToN8nItemId={sendingToN8nItemId}
              onSearchChange={onSearchChange}
              onSearchDebounced={onSearchDebounced}
              onOpenRelated={onOpenRelated}
              selectedNewsIds={selectedNewsIds}
              onToggleSelection={onToggleSelection}
              canSendToN8n={canSendToN8n}
            />
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        {visibleCategoryList.length === 0
          ? 'Selecciona al menos una categoría para ver noticias.'
          : `Mostrando columnas: ${visibleCategoryList.map((category) => CATEGORY_LABELS[category]).join(' • ')}`}
      </p>
    </main>
  )
}
