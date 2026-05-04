---@type ChadrcConfig
local M = {}

M.base46 = {
  theme = "material-deep-ocean",
  transparent = true,

  hl_override = {
    NvimTreeNormal       = { bg = "NONE" },
    NvimTreeNormalNC     = { bg = "NONE" },
    NvimTreeEndOfBuffer  = { bg = "NONE" },
    NvimTreeWinSeparator = { bg = "NONE" },
    StatusLine           = { bg = "NONE" },
    StatusLineNC         = { bg = "NONE" },
  },

  hl_add = {
    TbFill            = { bg = "NONE" },
    TbBufOn           = { bg = "NONE" },
    TbBufOff          = { bg = "NONE" },
    TbBufOnClose      = { bg = "NONE" },
    TbBufOffClose     = { bg = "NONE" },
    TbBufOnModified   = { bg = "NONE" },
    TbBufOffModified  = { bg = "NONE" },
    TbCloseAllBufsBtn = { bg = "NONE" },
    TbThemeToggleBtn  = { bg = "NONE" },
    TbTabCloseBtn     = { bg = "NONE" },
    TbTabOff          = { bg = "NONE" },
    TbTabOn           = { bg = "NONE" },
    TbTabNewBtn       = { bg = "NONE" },

    St_NormalMode     = { bg = "NONE", fg = "#ffc300" },
    St_InsertMode     = { bg = "NONE", fg = "#ffffff" },
    St_VisualMode     = { bg = "NONE", fg = "#81a2be" },
    St_CmdMode        = { bg = "NONE", fg = "#d99a5a" },
    St_ReplMode       = { bg = "NONE", fg = "#cc6666" },
    St_TermMode       = { bg = "NONE", fg = "#8abeb7" },
    St_pos            = { bg = "NONE", fg = "#969896" },
    St_fname          = { bg = "NONE", fg = "#c5c8c6" },
    St_dir            = { bg = "NONE", fg = "#969896" },
  },
}

M.ui = {
  statusline = { enabled = true },
  tabufline = {
    order = { "buffers", "tabs" },
  },
}

return M
