import { useState, useEffect } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import type { Group, LeaderboardEntry, WellnessPost, WellnessTip } from '../types'

const GROUP_TYPES: Record<string, string> = { dorm: '🏠 宿舍', class: '📚 班级', club: '🎯 社团', other: '👥 其他' }
const MEDALS = ['🥇', '🥈', '🥉']

export default function Community() {
  const { user } = useAuth()
  const [tab, setTab] = useState('groups')
  const [groups, setGroups] = useState<Group[]>([])
  const [posts, setPosts] = useState<WellnessPost[]>([])
  const [tips, setTips] = useState<WellnessTip[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', type: 'dorm' })
  const [joinCode, setJoinCode] = useState('')
  const [postContent, setPostContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => { loadGroups(); loadPosts(); loadTips(); setTimeout(() => setVisible(true), 100) }, [])

  const loadGroups = () => api.get('/community/groups').then(r => setGroups(r.data.groups || [])).catch(() => {})
  const loadPosts = () => api.get('/community/posts').then(r => setPosts(r.data.posts || [])).catch(() => {})
  const loadTips = () => api.get('/community/tips').then(r => setTips(r.data.tips || [])).catch(() => {})
  const loadLeaderboard = (gid: number) => api.get(`/community/groups/${gid}/leaderboard`).then(r => setLeaderboard(r.data.leaderboard || [])).catch(() => {})

  const createGroup = async () => {
    if (!newGroup.name.trim()) return
    await api.post(`/community/groups?name=${encodeURIComponent(newGroup.name)}&group_type=${newGroup.type}`)
    setShowCreate(false)
    setNewGroup({ name: '', type: 'dorm' })
    loadGroups()
  }

  const joinGroup = async () => {
    if (!joinCode.trim()) return
    await api.post(`/community/groups/join?code=${joinCode}`)
    setShowJoin(false)
    setJoinCode('')
    loadGroups()
  }

  const sendPost = async () => {
    if (!postContent.trim()) return
    await api.post(`/community/posts?content=${encodeURIComponent(postContent)}&is_anonymous=${isAnonymous}`)
    setPostContent('')
    setIsAnonymous(false)
    loadPosts()
  }

  const deletePost = async (postId: number) => {
    if (!confirm('确定删除这条帖子吗？')) return
    await api.delete(`/community/posts/${postId}`)
    loadPosts()
  }

  const tabs = [
    { key: 'groups', label: '👥 小组', desc: '创建或加入' },
    { key: 'posts', label: '💬 互助', desc: '分享交流' },
    { key: 'tips', label: '💡 知识', desc: '养生科普' },
  ]

  return (
    <div className="space-y-4">
      <h2 className={`page-title transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        🤝 校园互助
      </h2>

      {/* Tabs */}
      <div className={`grid grid-cols-3 gap-2 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`py-3 rounded-xl text-center transition-all duration-200 ${
              tab === t.key
                ? 'text-white shadow-md scale-[1.02]'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            style={tab === t.key ? { backgroundColor: 'var(--mc-bg)' } : undefined}
          >
            <div className="text-base">{t.label}</div>
            <div className={`text-[10px] mt-0.5 ${tab === t.key ? 'text-white/70' : 'text-gray-400'}`}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* ===== 小组 Tab ===== */}
      {tab === 'groups' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex gap-2">
            <button onClick={() => { setShowCreate(!showCreate); setShowJoin(false) }} className="btn-outline text-sm flex-1">
              + 创建小组
            </button>
            <button onClick={() => { setShowJoin(!showJoin); setShowCreate(false) }} className="btn-outline text-sm flex-1">
              🔗 加入小组
            </button>
          </div>

          {showCreate && (
            <div className="card space-y-3 animate-fade-in-scale">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">创建小组</h3>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none">✕</button>
              </div>
              <input className="input-field" placeholder="小组名称" value={newGroup.name}
                onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))} autoFocus />
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(GROUP_TYPES).map(([k, v]) => (
                  <button key={k} onClick={() => setNewGroup(p => ({ ...p, type: k }))}
                    className={`py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      newGroup.type === k
                        ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 ring-1 ring-violet-300 dark:ring-violet-500/50'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >{v}</button>
                ))}
              </div>
              <button onClick={createGroup} className="btn-primary w-full">创建</button>
            </div>
          )}

          {showJoin && (
            <div className="card space-y-3 animate-fade-in-scale">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">加入小组</h3>
                <button onClick={() => setShowJoin(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none">✕</button>
              </div>
              <input className="input-field text-center text-lg tracking-[0.3em] font-mono" placeholder="输入6位邀请码"
                value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} autoFocus />
              <button onClick={joinGroup} className="btn-primary w-full">加入</button>
            </div>
          )}

          {groups.map((g, gi) => (
            <div key={g.id} className="card animate-fade-in-up" style={{ animationDelay: `${gi * 60}ms` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-xl">
                    {GROUP_TYPES[g.type]?.split(' ')[0] || '👥'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{g.name}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {GROUP_TYPES[g.type] || g.type}
                      <span className="mx-1.5 text-gray-300">·</span>
                      邀请码 <span className="font-mono text-violet-600 dark:text-violet-400 font-medium">{g.invite_code}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setActiveGroup(activeGroup?.id === g.id ? null : g); loadLeaderboard(g.id) }}
                  className={`text-xs font-medium transition-colors px-2.5 py-1 rounded-lg ${
                    activeGroup?.id === g.id
                      ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400'
                      : 'text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  🏆 排行
                </button>
              </div>

              {activeGroup?.id === g.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">🏆 今日打卡排行</div>
                  {leaderboard.length > 0 ? (
                    <div className="space-y-1.5">
                      {leaderboard.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base w-6 text-center">
                              {i < 3 ? MEDALS[i] : <span className="text-gray-300 dark:text-gray-600 text-xs">{i + 1}</span>}
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-200">{entry.nickname}</span>
                          </div>
                          <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">{entry.checkins_today} 打卡</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-gray-400">暂无打卡数据</div>
                  )}
                </div>
              )}
            </div>
          ))}

          {groups.length === 0 && !showCreate && !showJoin && (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-4xl mb-3">👥</div>
              <div className="text-sm text-gray-400 dark:text-gray-500">还没有加入任何小组</div>
              <div className="text-xs text-gray-300 dark:text-gray-600 mt-1">创建一个小组，邀请同学一起打卡吧</div>
            </div>
          )}
        </div>
      )}

      {/* ===== 互助 Tab ===== */}
      {tab === 'posts' && (
        <div className="space-y-3 animate-fade-in">
          <div className="card space-y-3">
            <textarea className="input-field" rows={3} placeholder="分享你的养生经验或匿名求助..."
              value={postContent} onChange={e => setPostContent(e.target.value)} />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded accent-violet-500" />
                匿名发布
              </label>
              <span className="text-xs text-gray-400">{postContent.length}/500</span>
              <button onClick={sendPost} className="btn-primary text-sm px-5" disabled={!postContent.trim()}>
                发布
              </button>
            </div>
          </div>

          {posts.map((p, pi) => (
            <div key={p.id} className="card animate-fade-in-up" style={{ animationDelay: `${pi * 60}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-sm">
                    {p.is_anonymous ? '🎭' : '👤'}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{p.author}</span>
                    <span className="text-xs text-gray-400 ml-2">{p.created_at?.slice(0, 16)?.replace('T', ' ')}</span>
                  </div>
                </div>
                {p.user_id === user?.id && (
                  <button onClick={() => deletePost(p.id)}
                    className="text-xs text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors px-1">✕</button>
                )}
              </div>
              {(p.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {(p.tags || []).map((t, i) => (
                    <span key={i} className="text-[10px] bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{p.content}</p>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-4xl mb-3">💬</div>
              <div className="text-sm text-gray-400 dark:text-gray-500">还没有帖子</div>
              <div className="text-xs text-gray-300 dark:text-gray-600 mt-1">来分享第一条养生经验吧</div>
            </div>
          )}
        </div>
      )}

      {/* ===== 知识 Tab ===== */}
      {tab === 'tips' && (
        <div className="space-y-3 animate-fade-in">
          {tips.map((t, i) => (
            <div key={i} className="card animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-lg shrink-0">
                  💡
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">{t.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t.content}</p>
                </div>
              </div>
            </div>
          ))}
          {tips.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">💡</div>
              <div className="text-sm text-gray-400">暂无养生知识</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
