import * as Web3Client from '@web3-storage/w3up-client'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult {
  cid: string
  url: string
}

class Web3StorageClient {
  private client: Web3Client.Client | undefined
  private account: Web3Client.Account.Account | undefined
  private isInitialized = false

  async initialize() {
    if (typeof window === "undefined") {
      throw new Error("Web3StorageClient must be used on the client side only.")
    }

    if (this.isInitialized && this.client) return true
    this.client = await Web3Client.create()

    this.isInitialized = true
    console.log('[w3up] Client initialized. Agent DID:', this.client?.agent.did())
    return true
  }

  async authenticate(email: `${string}@${string}`) {
    await this.initialize()
    try {
      const account = await this.client?.login(email)
      this.account = account
      await account?.plan.wait()
      console.log('[w3up] ✅ Logged in:', this.account?.toJSON())

      const spaces = this.client?.spaces()
      const space = spaces?.find((space) => space.name === "NFThing")

      if(!space){
        const space = await this.client?.createSpace(`NFThing`,{account: this.account})
        console.log('[w3up] Space:', space)
        await this.client?.setCurrentSpace(space!.did())
  
      }else{
        console.log('[w3up] Space:', space)
        await this.client?.setCurrentSpace(space!.did())
      }
      return true
    } catch (error) {
      console.error('Web3StorageClient authenticate error:', error)
      throw error
    }
  }  

  async uploadFile(file: File): Promise<UploadResult> {
    await this.initialize()
    try {
      if (!this.client?.currentSpace()) throw new Error('No Space set. Authenticate and create or set a Space.')
      console.log('[w3up] Uploading file:', file.name)
      const cid = await this.client?.uploadFile(file)
      console.log('[w3up] ✅ Upload complete:', cid?.toString())

      return {
        cid: cid!.toString(),
          url: `https://${cid!.toString()}.ipfs.w3s.link`,
      }
    } catch (error) {
      console.error('Web3StorageClient uploadFile error:', error)
      throw error
    }
  }

  async uploadDirectory(files: File[], onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    await this.initialize()
    try {
      if (!this.client?.currentSpace()) throw new Error('No Space set. Authenticate and create or set a Space.')

      const total = files.reduce((acc, file) => acc + file.size, 0)
      console.log('[w3up] Uploading directory:', files)

      const cid = await this.client?.uploadDirectory(files, {
        onShardStored: () => {
          if (onProgress) {
            onProgress({ loaded: total, total, percentage: 100 })
          }
        }
      })

      console.log('[w3up] ✅ Directory uploaded:', cid!.toString())
      

      return {
        cid: cid!.toString(),
          url: `https://${cid!.toString()}.ipfs.w3s.link/`,
      }
    } catch (error) {
      console.error('Web3StorageClient uploadDirectory error:', error)
      throw error
    }
  }

  async uploadJSON(data: any, filename: string): Promise<UploadResult> {
    await this.initialize()
    if (!this.client?.currentSpace()) throw new Error('No Space set.')

    const jsonString = JSON.stringify(data, null, 2)
    console.log('[w3up] Uploading JSON:', jsonString)

    const file = new File([jsonString], filename, { type: 'application/json' })
    return this.uploadFile(file)
  }
}

export const web3StorageClient = new Web3StorageClient()
