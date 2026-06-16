import { RootPage } from '@payloadcms/next/views'
import configPromise from '../../../../payload.config'
// 👈 新增這行：匯入自動產生的 importMap (注意相對路徑)
import { importMap } from '../importMap'

export default function Page({ params, searchParams }: any) {
  return (
    // 👈 同樣將 importMap 傳遞給 RootPage
    <RootPage 
      config={configPromise} 
      params={params} 
      searchParams={searchParams} 
      importMap={importMap} 
    />
  )
}