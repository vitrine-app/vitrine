{
  "targets": [
    {
      "target_name": "steamMonitor",
      "conditions": [
        ["OS==\"win\"", {
          "sources": [
            "windows/SteamMonitor.cpp"
          ],
          "librairies": [
            "Advapi32.lib"
          ]
        }],
        ["OS==\"linux\"", {
          "sources": [
            "linux/SteamMonitor.cpp"
          ]
        }]
      ]
    }
  ]
}
