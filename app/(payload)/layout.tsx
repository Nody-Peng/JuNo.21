import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import configPromise from '../../payload.config'
// ?? ?°å??™è?ï¼šåŒ¯?¥è‡ª?•ç”¢?Ÿç? importMap
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
    // ?? å°?importMap ?¶ä?å±¬æ€§å‚³?žé€²åŽ»
    <RootLayout config={configPromise} serverFunction={serverFunction} importMap={importMap}>
      {children}
    </RootLayout>
  )
}
