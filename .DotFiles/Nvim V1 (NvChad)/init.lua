vim.g.base46_cache = vim .fn.stdpath "data" .. "/base46/"
vim.g.mapleader = " "

vim.opt.termguicolors = true

-- bootstrap lazy and all plugins
local lazypath = vim.fn.stdpath "data" .. "/lazy/lazy.nvim"

if not vim.uv.fs_stat(lazypath) then
  local repo = "https://github.com/folke/lazy.nvim.git"
  vim.fn.system { "git", "clone", "--filter=blob:none", repo, "--branch=stable", lazypath }
end

vim.opt.rtp:prepend(lazypath)

local lazy_config = require "configs.lazy"

-- load plugins
require("lazy").setup({
  {
    "NvChad/NvChad",
    lazy = false,
    branch = "v2.5",
    import = "nvchad.plugins",
  },

  { import = "plugins" },
}, lazy_config)

-- load theme
dofile(vim.g.base46_cache .. "defaults")
-- dofile(vim.g.base46_cache .. "statusline")

require "options"
require "autocmds"

vim.schedule(function()
  require "mappings"
end)

-- ///////////////////////////////////////

vim.keymap.set("i", "<C-BS>", function()
  local line = vim.fn.getline(".")
  local col = vim.fn.col(".")
  local prev = col > 1 and line:sub(col-1, col-1) or " "
  local cur = line:sub(col, col) 
  if not prev:match("[%w_]") and cur:match("[%w_]") then
    local keys = vim.api.nvim_replace_termcodes("<C-o>bdaw", true, true, true)
    vim.api.nvim_feedkeys(keys, "n", false)
  end
end, { desc = "Delete previous whole word only at word start" })

vim.keymap.set("i", "<C-Del>", "<C-o>daw", { desc = "Delete whole word forward" })

-- //////////////////////////////////////

vim.keymap.set("n", "<A-Down>", ":move +1<CR>==", { desc = "Move line down" })
vim.keymap.set("n", "<A-Up>",   ":move -2<CR>==", { desc = "Move line up" })

vim.keymap.set("v", "<A-Down>", ":move '>+1<CR>gv=gv", { desc = "Move selection down" })
vim.keymap.set("v", "<A-Up>",   ":move '<-2<CR>gv=gv", { desc = "Move selection up" })

-- //////////////////////////////////////

local neoscroll = require("neoscroll")
vim.keymap.set("n", "<C-d>", function() neoscroll.ctrl_d({ duration = 150 }) end)
vim.keymap.set("n", "<C-u>", function() neoscroll.ctrl_u({ duration = 150 }) end)
vim.keymap.set("n", "<C-f>", function() neoscroll.ctrl_f({ duration = 200 }) end)
vim.keymap.set("n", "<C-b>", function() neoscroll.ctrl_b({ duration = 200 }) end)
vim.keymap.set("v", "<C-d>", function() neoscroll.ctrl_d({ duration = 150 }) end)
vim.keymap.set("v", "<C-u>", function() neoscroll.ctrl_u({ duration = 150 }) end)

-- ///////////////////////////////////////

vim.keymap.set("n", "<leader>r", function()
  local word = vim.fn.expand("<cword>")
  if word == "" then return end
  vim.ui.input({ prompt = "Replace '" .. word .. "' with: " }, function(new_word)
    if new_word and new_word ~= "" then
      vim.cmd(string.format("%%s/\\<%s\\>/%s/g", word, new_word))
    end
  end)
end, { desc = "Replace word under cursor" })

vim.keymap.set("v", "<leader>r", function()
  local start_pos = vim.fn.getpos("'<")
  local end_pos = vim.fn.getpos("'>")
  local lines = vim.fn.getregion(start_pos, end_pos, vim.fn.visualmode(), "v")
  local text = type(lines) == "table" and table.concat(lines, "\n") or lines
  if text == "" then return end
  vim.ui.input({ prompt = "Replace '" .. text .. "' with: " }, function(new_text)
    if new_text and new_text ~= "" then
      local escaped = text:gsub("\\", "\\\\"):gsub("/", "\\/")
      vim.cmd(string.format("%%s/%s/%s/g", escaped, new_text))
    end
  end)
end, { desc = "Replace visual selection" })

-- /////////////////////////////////////////
