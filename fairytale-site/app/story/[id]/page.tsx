import { supabase, Story } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 86400

async function getStory(id: string): Promise<Story | null> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .lte('published_at', new Date().toISOString())
    .single()
  
  if (error || !data) return null
  return data
}

async function getRelatedStories(currentId: number): Promise<Story[]> {
  const { data } = await supabase
    .from('stories')
    .select('id, title, cover_emoji, published_at')
    .neq('id', currentId)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(3)
  return (data || []) as Story[]
}

export default async function StoryPage({ params }: { params: { id: string } }) {
  const story = await getStory(params.id)
  if (!story) notFound()

  const related = await getRelatedStories(story.id)

  const paragraphs = story.content.split('\n').filter(p => p.trim().length > 0)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="back-link">
              ← Казковий Край
            </Link>
            <div className="story-date-header">
              {new Date(story.published_at).toLocaleDateString('uk-UA', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="container story-main">
        {/* Обкладинка казки */}
        <div className="story-cover">
          <div className="cover-emoji-big">{story.cover_emoji}</div>
          <h1 className="story-h1">{story.title}</h1>
          <div className="story-moral-banner">
            💡 <em>{story.moral}</em>
          </div>
        </div>

        {/* Текст казки */}
        <article className="story-article">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="story-paragraph">
              {paragraph}
            </p>
          ))}
        </article>

        {/* Кінець казки */}
        <div className="story-end">
          <span>🌙 Кінець 🌙</span>
        </div>

        {/* Схожі казки */}
        {related.length > 0 && (
          <section className="related-section">
            <div className="section-label">Інші казки</div>
            <div className="related-grid">
              {related.map(s => (
                <Link key={s.id} href={`/story/${s.id}`} className="related-card">
                  <span className="related-emoji">{s.cover_emoji}</span>
                  <span className="related-title">{s.title}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>🧚 Казки генеруються за допомогою штучного інтелекту щодня о 7:00</p>
      </footer>
    </div>
  )
}
