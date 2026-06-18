import type { WFModel } from "../src/types";

const model: WFModel = {
  feature: "News Feed App",
  change: "Main feed and post creation",
  designSource: "guess: social media",
  screens: [
    {
      id: "s_feed",
      name: "Home Feed",
      states: [
        {
          id: "default",
          name: "Default",
          nodes: [
            {
              type: "row",
              children: [
                {
                  type: "nav",
                  side: "left",
                  groups: [
                    {
                      label: "Menu",
                      items: [
                        { text: "Home", active: true, goto: "s_feed" },
                        { text: "Explore" },
                        { text: "Notifications", badge: "3" },
                        { text: "Messages" },
                        { text: "Profile" },
                      ],
                    },
                  ],
                },
                {
                  type: "col",
                  children: [
                    { type: "box", kind: "tabs", tabs: ["For You", "Following"], activeTab: 0 },
                    {
                      type: "box",
                      kind: "card",
                      title: "What's happening?",
                      stats: ["Share a post"],
                      opens: "m_compose",
                      backend: "POST /api/posts",
                      ds: "guess: Card / interactive",
                    },
                    {
                      type: "box",
                      kind: "card",
                      title: "Alice Smith",
                      meta: ["@alicesmith", "2h ago"],
                      label: "Just shipped a new feature for our product! 🚀 It's been a long journey but the results are totally worth it.",
                      stats: ["12 Likes", "4 Comments"],
                      goto: "s_post_detail",
                      backend: "GET /api/feed",
                      ds: "guess: FeedItem / default",
                    },
                    {
                      type: "box",
                      kind: "card",
                      title: "Bob Builder",
                      meta: ["@bob", "4h ago"],
                      label: "Check out this amazing photo I took during my morning hike.",
                      children: [{ type: "box", kind: "image", label: "Mountain sunrise" }],
                      stats: ["45 Likes", "2 Comments", "1 Share"],
                      backend: "GET /api/feed",
                      ds: "guess: FeedItem / image",
                    },
                    {
                      type: "box",
                      kind: "card",
                      title: "Web Dev News",
                      meta: ["@webdev", "10h ago"],
                      label: "What's your favorite frontend framework right now?",
                      children: [{ type: "box", kind: "list", items: ["React", "Vue", "Svelte", "Angular"] }],
                      stats: ["102 Votes", "15 Comments"],
                      backend: "GET /api/feed",
                      ds: "guess: FeedItem / poll",
                    },
                  ],
                },
                {
                  type: "col",
                  children: [
                    {
                      type: "box", kind: "card", title: "Trending", backend: "GET /api/trending", ds: "guess: SidebarCard / list", children: [
                        { type: "box", kind: "list", items: ["1. #TechNews - 150K posts", "2. #AI - 102K posts", "3. Next.js 15 Release - 50K posts", "4. #DesignSpace - 20K posts"] }
                      ]
                    },
                    {
                      type: "box", kind: "card", title: "Who to follow", backend: "GET /api/suggestions", ds: "guess: SidebarCard / userList", children: [
                        {
                          type: "col", children: [
                            {
                              type: "row", mods: ["middle"], children: [
                                { type: "box", kind: "avatar", initials: "JD" },
                                {
                                  type: "col", mods: ["compact"], children: [
                                    { type: "box", kind: "heading", level: 5, label: "Jane Doe" },
                                    { type: "box", kind: "heading", level: 6, label: "@janedoe" }
                                  ]
                                },
                                { type: "box", kind: "button", label: "Follow" }
                              ]
                            },
                            {
                              type: "row", mods: ["middle"], children: [
                                { type: "box", kind: "avatar", initials: "JS" },
                                {
                                  type: "col", mods: ["compact"], children: [
                                    { type: "box", kind: "heading", level: 5, label: "John Smith" },
                                    { type: "box", kind: "heading", level: 6, label: "@johnsmith" }
                                  ]
                                },
                                { type: "box", kind: "button", label: "Follow" }
                              ]
                            },
                            {
                              type: "row", mods: ["middle"], children: [
                                { type: "box", kind: "avatar", initials: "TC" },
                                {
                                  type: "col", mods: ["compact"], children: [
                                    { type: "box", kind: "heading", level: 5, label: "Tech Corp" },
                                    { type: "box", kind: "heading", level: 6, label: "@techcorp" }
                                  ]
                                },
                                { type: "box", kind: "button", label: "Follow" }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s_post_detail",
      name: "Post Detail",
      states: [
        {
          id: "default",
          name: "Default",
          nodes: [
            {
              type: "row",
              children: [
                {
                  type: "nav",
                  side: "left",
                  groups: [
                    {
                      label: "Menu",
                      items: [
                        { text: "Home", goto: "s_feed" },
                        { text: "Explore" },
                        { text: "Notifications", badge: "3" },
                        { text: "Messages" },
                        { text: "Profile" },
                      ],
                    },
                  ],
                },
                {
                  type: "col",
                  children: [
                    {
                      type: "row",
                      children: [
                        { type: "box", kind: "button", label: "← Back", goto: "s_feed", action: "back" },
                        { type: "box", kind: "heading", label: "Post", level: 2 }
                      ]
                    },
                    {
                      type: "box",
                      kind: "card",
                      title: "Alice Smith",
                      meta: ["@alicesmith", "2h ago"],
                      label: "Just shipped a new feature for our product! 🚀 It's been a long journey but the results are totally worth it.",
                      stats: ["12 Likes", "4 Comments", "3 Reposts"],
                      backend: "GET /api/posts/:id",
                      ds: "guess: PostDetail / main",
                    },
                    { type: "box", kind: "input", label: "Post your reply", opens: "m_compose", backend: "POST /api/posts/:id/reply", ds: "guess: ReplyInput / default" },
                    {
                      type: "box",
                      kind: "card",
                      title: "Charlie",
                      meta: ["@charlie", "1h ago"],
                      label: "Looks amazing! Can't wait to try it.",
                      stats: ["2 Likes"],
                      backend: "GET /api/posts/:id/replies",
                      ds: "guess: ReplyItem / default",
                    },
                    {
                      type: "box",
                      kind: "card",
                      title: "Dave",
                      meta: ["@dave", "30m ago"],
                      label: "Is there a changelog available?",
                      stats: ["1 Like", "1 Comment"],
                      backend: "GET /api/posts/:id/replies",
                      ds: "guess: ReplyItem / default",
                    }
                  ],
                },
                {
                  type: "col",
                  children: [
                    {
                      type: "box", kind: "card", title: "Trending", backend: "GET /api/trending", ds: "guess: SidebarCard / list", children: [
                        { type: "box", kind: "list", items: ["1. #TechNews - 150K posts", "2. #AI - 102K posts", "3. Next.js 15 Release - 50K posts", "4. #DesignSpace - 20K posts"] }
                      ]
                    },
                    {
                      type: "box", kind: "card", title: "Who to follow", backend: "GET /api/suggestions", ds: "guess: SidebarCard / userList", children: [
                        {
                          type: "col", children: [
                            {
                              type: "row", mods: ["middle"], children: [
                                { type: "box", kind: "avatar", initials: "JD" },
                                {
                                  type: "col", mods: ["compact"], children: [
                                    { type: "box", kind: "heading", level: 5, label: "Jane Doe" },
                                    { type: "box", kind: "heading", level: 6, label: "@janedoe" }
                                  ]
                                },
                                { type: "box", kind: "button", label: "Follow" }
                              ]
                            },
                            {
                              type: "row", mods: ["middle"], children: [
                                { type: "box", kind: "avatar", initials: "JS" },
                                {
                                  type: "col", mods: ["compact"], children: [
                                    { type: "box", kind: "heading", level: 5, label: "John Smith" },
                                    { type: "box", kind: "heading", level: 6, label: "@johnsmith" }
                                  ]
                                },
                                { type: "box", kind: "button", label: "Follow" }
                              ]
                            },
                            {
                              type: "row", mods: ["middle"], children: [
                                { type: "box", kind: "avatar", initials: "TC" },
                                {
                                  type: "col", mods: ["compact"], children: [
                                    { type: "box", kind: "heading", level: 5, label: "Tech Corp" },
                                    { type: "box", kind: "heading", level: 6, label: "@techcorp" }
                                  ]
                                },
                                { type: "box", kind: "button", label: "Follow" }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  modals: [
    {
      id: "m_compose",
      name: "Create Post",
      nodes: [
        {
          type: "box",
          kind: "form",
          fields: [
            { label: "Your post", type: "textarea", placeholder: "What's on your mind?" },
            { label: "Attach Image", type: "upload", uploadLabel: "Select file" }
          ],
          backend: "POST /api/posts (multipart)",
          ds: "guess: Form / standard",
        },
        { type: "box", kind: "button", label: "Post", action: "submit", goto: "s_feed" },
      ],
    },
  ],
};

export default model;
