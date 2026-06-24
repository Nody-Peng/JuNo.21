import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import configPromise from '../../payload.config'
// 👈 新增這行：匯入自動產生的 importMap
import { importMap } from './admin/importMap' 
import '@payloadcms/next/css'
import './custom.css'

const serverFunction = async function (args: any) {
  'use server'
  return handleServerFunctions({
    ...args,
    config: configPromise,
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // 👈 將 importMap 當作屬性傳遞進去
    <RootLayout config={configPromise} serverFunction={serverFunction} importMap={importMap}>
      {children}
    </RootLayout>
  )
}