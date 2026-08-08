-- Customize blink.cmp <Tab>/<S-Tab> behavior:
--   * completion menu visible -> <Tab>/<S-Tab> move the selection (navigate)
--   * active snippet           -> <Tab>/<S-Tab> jump between snippet tabstops
--   * otherwise                -> fall back to the normal keymap (insert 4 spaces)
-- `auto_insert` is disabled so moving the selection never writes the highlighted
-- item into the buffer (that caused the cursor to jump to the end of a random word).

---@type LazySpec
return {
  "saghen/blink.cmp",
  ---@type BlinkCmpConfig
  opts = {
    completion = {
      list = { selection = { auto_insert = false } },
    },
    keymap = {
      ["<Tab>"] = { "select_next", "snippet_forward", "fallback" },
      ["<S-Tab>"] = { "select_prev", "snippet_backward", "fallback" },
    },
  },
}
