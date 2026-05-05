require "nvchad.autocmds"

local function setup_statusline()
  vim.opt.laststatus = 3
  vim.opt.statusline = "%!v:lua.require('configs.statusline').render()"
end

local function apply_transparent()
  local groups = {
    "StatusLine", "StatusLineNC",
    "St_NormalMode", "St_InsertMode", "St_VisualMode", "St_CmdMode",
    "St_ReplMode", "St_TermMode", "St_pos", "St_fname", "St_dir",
    "Normal", "NormalNC",
    "NvimTreeNormal", "NvimTreeNormalNC", "NvimTreeEndOfBuffer",
  }

  for _, group in ipairs(groups) do
    vim.api.nvim_set_hl(0, group, { bg = "NONE" })
  end

  vim.api.nvim_set_hl(0, "Normal", { bg = "NONE", ctermbg = "NONE" })
end

vim.api.nvim_create_autocmd({ "VimEnter", "ColorScheme" }, {
  callback = function()
    setup_statusline()
    apply_transparent()
  end,
})

vim.api.nvim_create_autocmd("ColorScheme", {
  callback = function()
    apply_transparent()
    setup_statusline()
  end,
})

vim.api.nvim_create_autocmd("FileType", {
  pattern = "NvimTree",
  callback = function()
    vim.opt_local.statusline = ""
  end,
})
