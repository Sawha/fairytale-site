import { supabase, Story } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 3600 // Оновлюємо кеш щогодини

async function getStories(): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
  
  if (error) {
    console.error(error)
    return []
  }
  return data || []
}

export default async function HomePage() {
  const stories = await getStories()
  const latestStory = stories[0]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Заголовок */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="logo">
              <span className="logo-emoji">🌙</span>
              <div>
                <h1 className="site-title">Казковий Край</h1>
                <p className="site-subtitle">Нова казка кожного ранку о 7:00</p>
              </div>
            </div>
            <div className="header-badge">
              <span className="badge-dot"></span>
              {stories.length} казок
            </div>
          </div>
        </div>
      </header>

      <main className="container main-content">
        {/* Остання казка — велика картка */}
        {latestStory && (
          <section className="featured-section">
            <div className="section-label">✨ Сьогоднішня казка</div>
            <Link href={`/story/${latestStory.id}`} className="featured-card">
              <div className="featured-emoji">{latestStory.cover_emoji}</div>
              <div className="featured-body">
                <h2 className="featured-title">{latestStory.title}</h2>
                <p className="featured-preview">
                  {latestStory.content.slice(0, 180)}...
                </p>
                <div className="featured-meta">
                  <span className="moral-tag">💡 {latestStory.moral}</span>
                  <span className="read-btn">Читати →</span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Решта казок — сітка */}
        {stories.length > 1 && (
          <section>
            <div className="section-label">📚 Всі казки</div>
            <div className="stories-grid">
              {stories.slice(1).map((story) => (
                <Link key={story.id} href={`/story/${story.id}`} className="story-card">
                  <div className="story-emoji">{story.cover_emoji}</div>
                  <div className="story-body">
                    <h3 className="story-title">{story.title}</h3>
                    <p className="story-preview">{story.content.slice(0, 100)}...</p>
                    <div className="story-date">
                      {new Date(story.published_at).toLocaleDateString('uk-UA', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {stories.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: '5rem' }}>🌟</div>
            <h2>Казки ще готуються...</h2>
            <p>Перша казка з'явиться сьогодні о 7:00 ранку!</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>🧚 Казки генеруються за допомогою штучного інтелекту щодня о 7:00</p>
      </footer>
    </div>
  )
}
