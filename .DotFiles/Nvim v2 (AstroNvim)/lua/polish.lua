-- This will run last in the setup process.
-- This is just pure lua so anything that doesn't
-- fit in the normal config locations above can go here

-- Force 4-space indentation on every buffer, including files opened via the command line.
local indent_augroup = vim.api.nvim_create_augroup("Indent4Spaces", { clear = true })
vim.api.nvim_create_autocmd("FileType", {
  group = indent_augroup,
  desc = "Force 4-space indentation",
  callback = function()
    vim.bo.tabstop = 4
    vim.bo.softtabstop = 4
    vim.bo.shiftwidth = 4
    vim.bo.expandtab = true
  end,
})

-- Make <Tab> always insert spaces to the next tab stop (4 spaces), never
-- interact with the completion menu. The completion menu auto-inserts the
-- highlighted item, which moves the cursor to the end of a random word.
-- Snippet jump is preserved when a snippet is actually active.
vim.keymap.set("i", "<Tab>", function()
  if vim.snippet.active({ direction = 1 }) then
    return "<Cmd>lua vim.snippet.jump(1)<CR>"
  end
  local sw = vim.bo.softtabstop > 0 and vim.bo.softtabstop or vim.bo.tabstop
  if not vim.bo.expandtab then return "\t" end
  local col = vim.fn.col(".") - 1
  return string.rep(" ", sw - (col % sw))
end, { expr = true, silent = true, desc = "Insert spaces to next tab stop" })

vim.keymap.set("i", "<S-Tab>", function()
  if vim.snippet.active({ direction = -1 }) then
    return "<Cmd>lua vim.snippet.jump(-1)<CR>"
  end
  local sw = vim.bo.softtabstop > 0 and vim.bo.softtabstop or vim.bo.tabstop
  local col = vim.fn.col(".") - 1
  local back = col % sw
  if back == 0 then back = sw end
  return vim.api.nvim_replace_termcodes("<C-h>", true, false, true):rep(back)
end, { expr = true, silent = true, desc = "Delete back to previous tab stop" })
