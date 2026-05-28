// Shared music controller — works across components without React context plumbing.
// EnvelopeAnimation dispatches play within the user gesture to bypass autoplay restrictions.
export const MUSIC_PLAY_EVENT = 'wedding:play-music';
export function requestPlayMusic() {
  window.dispatchEvent(new CustomEvent(MUSIC_PLAY_EVENT));
}
