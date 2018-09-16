{
  "targets": [
    {
      "target_name": "gameLauncher",
      "conditions": [
        ["OS==\"windows\"", {
          "sources": [
            "windows/GameLauncher.cpp"
          ]
        }],
        ["OS==\"linux\"", {
          "sources": [
            "linux/GameLauncher.cpp"
          ]
        }]
      ]
    }
  ]
}
