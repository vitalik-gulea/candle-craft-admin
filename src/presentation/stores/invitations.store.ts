import { create } from 'zustand'
import { getInvitationUseCase } from '../../application/auth/get-invitation.use-case'
import { inviteUserUseCase } from '../../application/auth/invite-user.use-case'
import { AuthError } from '../../domain/auth/errors'
import type { Invitation, InvitationPreview, InviteUserInput } from '../../domain/auth/types'
import { authApi } from '../../infrastructure/auth/auth.api'

type PreviewStatus = 'idle' | 'loading' | 'ready' | 'invalid' | 'error'

interface InvitationsState {
  preview: InvitationPreview | null
  previewStatus: PreviewStatus
  isInviting: boolean
  loadPreview: (token: string) => Promise<void>
  invite: (input: InviteUserInput) => Promise<Invitation | AuthError>
}

let latestPreviewRequestId = 0

export const useInvitationsStore = create<InvitationsState>((set) => ({
  preview: null,
  previewStatus: 'idle',
  isInviting: false,

  async loadPreview(token) {
    const requestId = ++latestPreviewRequestId
    set({ preview: null, previewStatus: 'loading' })
    try {
      const preview = await getInvitationUseCase(authApi, token)
      if (requestId !== latestPreviewRequestId) return
      set({ preview, previewStatus: 'ready' })
    } catch (error) {
      if (requestId !== latestPreviewRequestId) return
      const invalid = error instanceof AuthError && error.code === 'INVALID_INVITATION'
      set({ preview: null, previewStatus: invalid ? 'invalid' : 'error' })
    }
  },

  async invite(input) {
    set({ isInviting: true })
    try {
      const invitation = await inviteUserUseCase(authApi, input)
      set({ isInviting: false })
      return invitation
    } catch (error) {
      set({ isInviting: false })
      return error instanceof AuthError ? error : new AuthError('UNKNOWN')
    }
  },
}))
