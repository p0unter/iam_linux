return {
  {
    "stevearc/conform.nvim",
    -- event = 'BufWritePre', -- uncomment for format on save
    opts = require "configs.conform",
  },

  -- These are some examples, uncomment them if you want to see them work!
  {
    "neovim/nvim-lspconfig",
    config = function()
      require "configs.lspconfig"
    end,
  },

  {
    "sphamba/smear-cursor.nvim",
    event = "VeryLazy",
    opts = {
      time_interval = 15,            -- Lower is smoother (ms). Default is 17.
      
      stiffness = 0.8,              -- Snap speed (0 to 1). 0.8 is "snappy".
      trailing_stiffness = 0.5,      -- How fast the tail catches up.
      damping = 0.8,                -- Bounciness (lower = more elastic). 
      
      -- 3. VISUAL ENHANCEMENT
      legacy_computing_symbols_support = true, 
      
      -- 4. SMART BEHAVIOR
      smear_between_buffers = true,         -- Smear when switching splits
      smear_between_neighbor_lines = true,  -- Smear even on small movements
      scroll_buffer_space = true,           -- Smoother trail while scrolling
      
      -- 5. THEME INTEGRATION
      cursor_color = "none", 
    },
  },
  -- test new blink
  -- { import = "nvchad.blink.lazyspec" },

  -- {
  -- 	"nvim-treesitter/nvim-treesitter",
  -- 	opts = {
  -- 		ensure_installed = {
  -- 			"vim", "lua", "vimdoc",
  --      "html", "css"
  -- 		},
  -- 	},
  -- },
}
