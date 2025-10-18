/**
 * 判断是否为外部链接
 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 格式化时间
 */
export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 处理数据库时间，确保显示正确的中国时区时间
 */
export function formatDatabaseTime(date: string | Date | null, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''
  
  // 如果是字符串，直接创建Date对象
  let d: Date
  if (typeof date === 'string') {
    d = new Date(date)
  } else {
    d = new Date(date)
  }
  
  // 确保时间正确显示（处理时区问题）
  const utcTime = d.getTime() + (d.getTimezoneOffset() * 60000)
  const chinaTime = new Date(utcTime + (8 * 3600000)) // 加8小时
  
  const year = chinaTime.getFullYear()
  const month = String(chinaTime.getMonth() + 1).padStart(2, '0')
  const day = String(chinaTime.getDate()).padStart(2, '0')
  const hour = String(chinaTime.getHours()).padStart(2, '0')
  const minute = String(chinaTime.getMinutes()).padStart(2, '0')
  const second = String(chinaTime.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 树形数据转换
 */
export function handleTree<T extends { [key: string]: any }>(
  data: T[],
  id: string = 'id',
  parentId: string = 'parentId',
  children: string = 'children'
): T[] {
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  }

  const childrenListMap: { [key: string]: T[] } = {}
  const nodeIds: { [key: string]: boolean } = {}
  const tree: T[] = []

  for (const d of data) {
    const parentIdValue = d[config.parentId]
    if (!childrenListMap[parentIdValue]) {
      childrenListMap[parentIdValue] = []
    }
    nodeIds[d[config.id]] = true
    childrenListMap[parentIdValue].push(d)
  }

  for (const d of data) {
    const parentIdValue = d[config.parentId]
    if (!nodeIds[parentIdValue]) {
      tree.push(d)
    }
  }

  const adaptToChildrenList = (o: T): T => {
    if (childrenListMap[o[config.id]] !== undefined) {
      o[config.childrenList] = childrenListMap[o[config.id]]
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) {
        adaptToChildrenList(c)
      }
    }
    return o
  }

  for (const t of tree) {
    adaptToChildrenList(t)
  }

  return tree
}

/**
 * 参数处理
 */
export function tansParams(params: Record<string, any>): string {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part = encodeURIComponent(propName) + '='
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
            const params = propName + '[' + key + ']'
            const subPart = encodeURIComponent(params) + '='
            result += subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&'
      }
    }
  }
  return result
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  
  const clonedObj = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }
  return clonedObj
}

/**
 * 收集树形结构的所有ID（包括子级）
 */
export function collectTreeIds<T extends { [key: string]: any }>(
  data: T[],
  row: T,
  id: string = 'id',
  parentId: string = 'parentId',
  children: string = 'children'
): any[] {
  const ids: any[] = [row[id]]
  
  // 递归收集子级ID
  function collectChildren(item: T) {
    if (item[children] && Array.isArray(item[children])) {
      for (const child of item[children]) {
        ids.push(child[id])
        collectChildren(child)
      }
    }
  }
  
  // 从原始数据中查找该节点并收集子级
  function findAndCollect(items: T[]) {
    for (const item of items) {
      if (item[id] === row[id]) {
        collectChildren(item)
        return true
      }
      if (item[children] && Array.isArray(item[children])) {
        if (findAndCollect(item[children])) {
          return true
        }
      }
    }
    return false
  }
  
  findAndCollect(data)
  return ids
}

