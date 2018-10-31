{
  "targets": [
    {
      "target_name": "steamMonitor",
      "conditions": [
        ["OS==\"win\"", {
          "sources": [
            "srcs/windows/SteamMonitor.cpp"
          ],
          "librairies": [
            "Advapi32.lib"
          ]
        }],
        ["OS==\"linux\"", {
          "sources": [
            "srcs/linux/SteamMonitor.cpp"
          ]
        }]
      ]
    }
  ]
}
