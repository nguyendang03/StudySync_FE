import { lazy } from 'react';

// Lazy load video call components
export const VideoCall = lazy(() => import('./VideoCall'));
export const VideoCallButton = lazy(() => import('./VideoCallButton'));
export const VideoCallManager = lazy(() => import('./VideoCallManager'));
export const CallInitiator = lazy(() => import('./CallInitiator'));
export const InvitationModal = lazy(() => import('./InvitationModal'));
export const VideoCallChat = lazy(() => import('./VideoCallChat'));

// Keep default exports for backward compatibility
export { default as VideoCallDefault } from './VideoCall';
export { default as VideoCallButtonDefault } from './VideoCallButton';
export { default as VideoCallManagerDefault } from './VideoCallManager';
export { default as CallInitiatorDefault } from './CallInitiator';
export { default as InvitationModalDefault } from './InvitationModal';
export { default as VideoCallChatDefault } from './VideoCallChat';