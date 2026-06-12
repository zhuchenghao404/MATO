/**
 * 后台管理菜单配置
 * icon 使用 Element Plus Icons 的组件名
 * roles: 允许访问的角色，空数组表示所有角色
 */
export const adminMenu = [
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    meta: { title: '仪表盘', icon: 'Odometer' },
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    meta: { title: '用户管理', icon: 'User' },
  },
  {
    path: '/admin/works',
    name: 'WorkManagement',
    meta: { title: '作品管理', icon: 'PictureFilled' },
  },
  {
    path: '/admin/comments',
    name: 'CommentManagement',
    meta: { title: '评论管理', icon: 'ChatDotSquare' },
  },
]
