import { useState, useEffect } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const GROUP_TYPES = { dorm: '🏠 宿舍', class: '📚 班级', club: '🎯 社团', other: '👥 其他' }

export default function Community() {
  const { user } = useAuth()
  const [tab, setTab] = useState('groups')
  const [groups, setGroups] = useState([])
  const [posts, setPosts] = useState([])
  const [tips, setTips] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [activeGroup, setActiveGroup] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', type: 'dorm' })
  const [joinCode, setJoinCode] = useState('')
  const [postContent, setPostContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  useEffect(() => { loadGroups(); loadPosts(); loadTips() }, [])

  const loadGroups = () => api.get('/community/groups').then(r => setGroups(r.data.groups || [])).catch(() => {})
  const loadPosts = () => api.get('/community/posts').then(r => setPosts(r.data.posts || [])).catch(() => {})
  const loadTips = () => api.get('/community/tips').then(r => setTips(r.data.tips || [])).catch(() => {})
  const loadLeaderboard = (gid) => api.get(`/community/groups/${gid}/leaderboard`).then(r => setLeaderboard(r.data.leaderboard || [])).catch(() => {})

  const createGroup = async () => {
    await api.post(`/community/groups?name=${encodeURIComponent(newGroup.name)}&group_type=${newGroup.type}`)
    setShowCreate(false)
    setNewGroup({ name: '', type: 'dorm' })
    loadGroups()
  }

  const joinGroup = async () => {
    await api.post(`/community/groups/join?code=${joinCode}`)
    setShowJoin(false)
    setJoinCode('')
    loadGroups()
  }

  const sendPost = async () => {
    await api.post(`/community/posts?content=${encodeURIComponent(postContent)}&is_anonymous=${isAnonymous}`)
    setPostContent('')
    setIsAnonymous(false)
    loadPosts()
  }

  const deletePost = async (postId) => {
    if (!confirm('确定删除这条帖子吗？')) return
    await api.delete(`/community/posts/${postId}`)
    loadPosts()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">🤝 校园互助</h2>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'groups', label: '👥 小组' },
          { key: 'posts', label: '💬 互助' },
          { key: 'tips', label: '💡 知识' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm ${tab === t.key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >{t.label}</button>
        ))}
      </div>

      {/* Groups Tab */}
      {tab === 'groups' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(!showCreate)} className="btn-outline text-sm flex-1">+ 创建小组</button>
            <button onClick={() => setShowJoin(!showJoin)} className="btn-outline text-sm flex-1">🔗 加入小组</button>
          </div>

          {showCreate && (
            <div className="card space-y-2">
              <input className="input-field text-sm" placeholder="小组名称" value={newGroup.name}
                onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))} />
              <div className="flex gap-2">
                {Object.entries(GROUP_TYPES).map(([k, v]) => (
                  <button key={k} onClick={() => setNewGroup(p => ({ ...p, type: k }))}
                    className={`px-3 py-1.5 rounded-lg text-xs ${newGroup.type === k ? 'bg-primary-100 text-primary-700' : 'bg-gray-50 text-gray-500'}`}
                  >{v}</button>
                ))}
              </div>
              <button onClick={createGroup} className="btn-primary text-sm w-full">创建</button>
            </div>
          )}

          {showJoin && (
            <div className="card space-y-2">
              <input className="input-field text-sm" placeholder="输入6位邀请码" value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} />
              <button onClick={joinGroup} className="btn-primary text-sm w-full">加入</button>
            </div>
          )}

          {/* Group list */}
          {groups.map(g => (
            <div key={g.id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">{g.name}</div>
                  <div className="text-xs text-gray-400">{GROUP_TYPES[g.type] || g.type} · 邀请码: <span className="font-mono text-primary-600">{g.invite_code}</span></div>
                </div>
                <button onClick={() => { setActiveGroup(activeGroup === g.id ? null : g.id); loadLeaderboard(g.id) }}
                  className="text-xs text-primary-600">排行榜</button>
              </div>
              {activeGroup === g.id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-2">🏆 今日打卡排行</div>
                  {leaderboard.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300'}>
                          {i + 1}.
                        </span>
                        <span className="text-gray-600">{entry.nickname}</span>
                      </div>
                      <span className="text-xs text-primary-600">{entry.checkins_today} 打卡</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {groups.length === 0 && !showCreate && !showJoin && (
            <div className="text-center py-8 text-gray-400 text-sm">还没有加入任何小组，创建一个吧！</div>
          )}
        </div>
      )}

      {/* Posts Tab */}
      {tab === 'posts' && (
        <div className="space-y-3">
          <div className="card space-y-2">
            <textarea className="input-field text-sm" rows={3} placeholder="分享你的养生经验或匿名求助..." value={postContent}
              onChange={e => setPostContent(e.target.value)} />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1 text-xs text-gray-500">
                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                匿名发布
              </label>
              <button onClick={sendPost} className="btn-primary text-sm px-4" disabled={!postContent.trim()}>发布</button>
            </div>
          </div>

          {posts.map(p => (
            <div key={p.id} className="card relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{p.author}</span>
                  {(p.tags || []).map((t, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
                {p.user_id === user?.id && (
                  <button onClick={() => deletePost(p.id)}
                    className="text-xs text-gray-300 hover:text-red-400 transition-colors">✕ 删除</button>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{p.content}</p>
              <div className="text-xs text-gray-300 mt-2">{p.created_at?.slice(0, 16)?.replace('T', ' ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tips Tab */}
      {tab === 'tips' && (
        <div className="space-y-2">
          {tips.map((t, i) => (
            <div key={i} className="card">
              <div className="text-sm font-medium text-primary-700 mb-1">{t.title}</div>
              <p className="text-xs text-gray-600 leading-relaxed">{t.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
