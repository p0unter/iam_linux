return {
  {
    "xiyaowong/transparent.nvim",
    opts_extend = { "extra_groups" },
    config = function(_, opts)
      local transparent = require "transparent"
      transparent.setup(opts)
      transparent.clear_prefix "BufferLine"
      transparent.clear_prefix "NeoTree"
      transparent.clear_prefix "lualine"
      vim.cmd.TransparentEnable()
    end,
    opts = {
      extra_groups = {
        "NormalFloat",
        "FloatBorder",
        "FloatTitle",
        "NormalSB",
        "NeoTreeNormal",
        "NeoTreeNormalNC",
        "NeoTreePreview",
        "NeoTreeTabInactive",
        "WinBar",
        "WinBarNC",
        "WinSeparator",
        "TreesitterContext",
        "SignColumn",
        "StatusLine",
        "StatusLineNC",
        "TabLine",
        "TabLineSel",
        "TabLineFill",
        "CursorLine",
        "CursorLineNr",
        "LineNr",
        "EndOfBuffer",
        "WhichKeyFloat",
        "NotifyINFOBody",
        "NotifyWARNBody",
        "NotifyERRORBody",
        "NotifyDEBUGBody",
        "NotifyTRACEBody",
        "NotifyINFOBorder",
        "NotifyWARNBorder",
        "NotifyERRORBorder",
        "NotifyDEBUGBorder",
        "NotifyTRACEBorder",
        "TelescopeBorder",
        "TelescopeNormal",
        "TelescopePreviewNormal",
        "TelescopeResultsNormal",
        "TelescopePromptNormal",
        "Pmenu",
        "PmenuSel",
        "PmenuSbar",
        "PmenuThumb",
      },
    },
  },
}
