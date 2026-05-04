require "nvchad.mappings"

local map = vim.keymap.set

vim.opt.clipboard = "unnamedplus"
vim.opt.relativenumber = false
vim.opt.number = true
vim.opt.guicursor = "a:block-Cursor"

vim.opt.tabstop = 2
vim.opt.shiftwidth = 2
vim.opt.softtabstop = 2
vim.opt.expandtab = true
vim.opt.smartindent = true

vim.opt.laststatus = 3

local transparent = false

local function set_transparent()
  local groups = {
    "TbFill", "TbBufOn", "TbBufOff", "TbBufOnClose", "TbBufOffClose",
    "TbBufOnModified", "TbBufOffModified", "TbLineBufOnActive", "TbLineBufOnInactive",
    "TbThemeToggleBtn", "TbCloseAllBufsBtn", "TbTabNewBtn", "TbTabOn", "TbTabOff", "TbTabCloseBtn",
    "StatusLine", "StatusLineNC",
    "St_NormalMode", "St_InsertMode", "St_VisualMode", "St_CmdMode",
    "St_ReplMode", "St_TermMode", "St_pos", "St_fname", "St_dir",
    "Normal", "NormalNC",
    "NvimTreeNormal", "NvimTreeNormalNC", "NvimTreeEndOfBuffer", "NvimTreeWinSeparator",
  }
  for _, g in ipairs(groups) do
    vim.api.nvim_set_hl(0, g, { bg = "NONE" })
  end
  vim.api.nvim_set_hl(0, "Normal", { bg = "NONE", ctermbg = "NONE" })
end

local function set_opaque()
  require("base46").load_all_highlights()
end

map("n", "<leader>tr", function()
  transparent = not transparent
  if transparent then
    set_transparent()
    vim.notify("Transparent ON", vim.log.levels.INFO)
  else
    set_opaque()
    vim.notify("Transparent OFF", vim.log.levels.INFO)
  end
end, { desc = "Toggle transparent background" })

map("n", ";", ":", { desc = "CMD enter command mode" })
map("i", "jk", "<ESC>")

