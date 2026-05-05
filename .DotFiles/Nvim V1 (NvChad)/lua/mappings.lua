require "nvchad.mappings"

local map = vim.keymap.set

map("n", ";", ":", { desc = "CMD enter command mode" })
map("i", "jk", "<ESC>")

-- ////////////////////////////

local transparent = true 

map("n", "<leader>tr", function()
  transparent = not transparent
  if transparent then
    vim.api.nvim_set_hl(0, "Normal",           { bg = "NONE", ctermbg = "NONE" })
    vim.api.nvim_set_hl(0, "NormalNC",         { bg = "NONE", ctermbg = "NONE" })
    vim.api.nvim_set_hl(0, "StatusLine",       { bg = "NONE" })
    vim.api.nvim_set_hl(0, "StatusLineNC",     { bg = "NONE" })
    vim.api.nvim_set_hl(0, "NvimTreeNormal",   { bg = "NONE" })
    vim.api.nvim_set_hl(0, "NvimTreeNormalNC", { bg = "NONE" })
    vim.notify("Transparent ON", vim.log.levels.INFO)
  else
    require("base46").load_all_highlights()
    vim.notify("Transparent OFF", vim.log.levels.INFO)
  end
end, { desc = "Toggle transparent background" })

map("i", "<C-Space>", function()
  require("cmp").complete()
end, { desc = "Trigger completion" })
