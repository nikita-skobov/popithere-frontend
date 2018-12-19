import PopItHere from '../Games/PopItHere2'

/**
 * @todo write a fetch helper
 * to fetch the current game from a server
 */
export function getCurrentGame({ renderer, root, modal }) {
  const modalInner = {
    // here we only want the Game instance
    // to have access to isOpen and toggle. we don't want
    // to give Game access to setState, render, etc.
    isOpen: modal.isOpen,
    toggle: modal.toggle,
  }

  return new PopItHere({
    renderer,
    root,
    modal,
  })
}