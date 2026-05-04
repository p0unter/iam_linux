local M = {}

M.render = function()
  local mode_info = {
    ["n"]  = { "- NORMAL", "St_NormalMode" },
    ["i"]  = { "+ INSERT",   "St_InsertMode" },
    ["v"]  = { "󰈈 VISUAL", "St_VisualMode" },
    ["V"]  = { "󰈈 V-LINE", "St_VisualMode" },
    [""]   = { "󰈈 V-BLOCK","St_VisualMode" },
    ["c"]  = { "COMMAND",  "St_CmdMode" },
    ["R"]  = { "REPLACE",  "St_ReplMode" },
    ["t"]  = { "TERMINAL", "St_TermMode" },
    ["s"]  = { "SELECT",   "St_VisualMode" },
  }

  local m = vim.api.nvim_get_mode().mode
  local info = mode_info[m] or { "󰋜 NORMAL", "St_NormalMode" }

  local stretch = "%="
  local mode_str = "%#" .. info[2] .. "# " .. info[1] .. " %*"
  local cursor   = "%#St_pos# %l:%c %*"
  local fname    = "%#St_fname#" .. (vim.fn.expand("%:t") ~= "" and vim.fn.expand("%:t") or "[No Name]") .. "%*"
  local dir      = "%#St_dir#  " .. vim.fn.fnamemodify(vim.fn.getcwd(), ":t") .. " %*"

  return mode_str .. stretch .. cursor .. fname .. dir
end

return M
