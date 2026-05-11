import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

// Теми казок — кожен день буде різна тематика
const STORY_THEMES = [
  'ліс і лісові звірі',
  'морські пригоди і русалки',
  'зачарований замок і принцеса',
  'маленький дракон який не вміє дихати вогнем',
  'чарівна бібліотека з книгами що оживають',
  'хоробрий горобчик',
  'місяць і зірки',
  'квіти що вміють говорити',
  'добра відьма і зачарований сад',
  'пригоди маленького їжачка',
  'чарівний олівець що малює мрії',
  'котик що шукав веселку',
  'королівство де всі бояться темряви',
  'маленька хмаринка',
  'старий маяк і його хранитель'
]

export async function POST(req: NextRequest) {
  // Перевіряємо секретний токен (захист від несанкціонованих запитів)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Вибираємо тему залежно від дня року
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    )
    const theme = STORY_THEMES[dayOfYear % STORY_THEMES.length]

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    })

    // Генеруємо казку через Claude
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Напиши чарівну українську казку на тему: "${theme}".

Вимоги:
- Мова: українська
- Довжина: 400-600 слів
- Стиль: добра, тепла казка для дітей 4-10 років
- Має бути чіткий сюжет з початком, серединою і кінцем
- Головний герой долає труднощі і вчиться чомусь важливому
- Закінчення має бути щасливим

Поверни відповідь СТРОГО у форматі JSON (без markdown, без \`\`\`):
{
  "title": "Назва казки",
  "content": "Повний текст казки...",
  "moral": "Коротка мораль казки (1 речення)",
  "cover_emoji": "один емодзі що символізує казку"
}`
        }
      ]
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    
    // Очищаємо від можливих markdown-обгорток
    const cleanJson = rawText.replace(/```json\n?|\n?```/g, '').trim()
    const storyData = JSON.parse(cleanJson)

    // Зберігаємо в Supabase
    const today = new Date()
    today.setHours(7, 0, 0, 0) // Встановлюємо час публікації 7:00

    const { data, error } = await supabaseAdmin
      .from('stories')
      .insert({
        title: storyData.title,
        content: storyData.content,
        moral: storyData.moral,
        cover_emoji: storyData.cover_emoji,
        published_at: today.toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      story: data,
      message: `Казку "${storyData.title}" успішно додано!`
    })

  } catch (err) {
    console.error('Generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate story', details: String(err) },
      { status: 500 }
    )
  }
}
