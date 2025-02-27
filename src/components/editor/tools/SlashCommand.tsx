import {
  CheckSquare,
  Code,
  ListBullets,
  ListNumbers,
  Quotes,
  TextH,
  TextHThree,
  TextHTwo,
  TextT,
  TwitterLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";
import type { Editor, Range } from "@tiptap/core";
import { Command, renderItems } from "../extensions/SlashCommand";

interface CommandProps {
  editor: Editor;
  range: Range;
}

// Smaller icon size constant
const ICON_SIZE = 14;

export const suggestionItems = [
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <TextT size={ICON_SIZE} className="text-muted-foreground" />,
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with a to-do list.",
    searchTerms: ["todo", "task", "list", "check", "checkbox"],
    icon: <CheckSquare size={ICON_SIZE} className="text-muted-foreground" />,
    command: ({ editor, range }: CommandProps) => {
      // Since toggleTaskList is not available, we'll use a regular bullet list
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <TextH size={ICON_SIZE} className="text-muted-foreground" />,
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: <TextHTwo size={ICON_SIZE} className="text-muted-foreground" />,
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <TextHThree size={ICON_SIZE} className="text-muted-foreground" />,
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <ListBullets size={ICON_SIZE} className="text-muted-foreground" />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListNumbers size={ICON_SIZE} className="text-muted-foreground" />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <Quotes size={ICON_SIZE} className="text-muted-foreground" />,
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run();
    },
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: <Code size={ICON_SIZE} className="text-muted-foreground" />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Youtube",
    description: "Embed a Youtube video.",
    searchTerms: ["video", "youtube", "embed"],
    icon: <YoutubeLogo size={ICON_SIZE} className="text-muted-foreground" />,
    command: ({ editor, range }: CommandProps) => {
      const videoLink = prompt("Please enter Youtube Video Link");
      //From https://regexr.com/3dj5t
      const ytregex = new RegExp(
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
      );

      if (videoLink && ytregex.test(videoLink)) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setYoutubeVideo({
            src: videoLink,
          })
          .run();
      } else {
        if (videoLink !== null) {
          alert("Please enter a correct Youtube Video Link");
        }
      }
    },
  },
  {
    title: "Twitter",
    description: "Embed a Tweet.",
    searchTerms: ["twitter", "embed"],
    icon: <TwitterLogo size={ICON_SIZE} className="text-muted-foreground" />,
    command: ({ editor, range }: CommandProps) => {
      const tweetLink = prompt("Please enter Twitter Link");
      const tweetRegex = new RegExp(
        /^https?:\/\/(www\.)?x\.com\/([a-zA-Z0-9_]{1,15})(\/status\/(\d+))?(\/\S*)?$/
      );

      if (tweetLink && tweetRegex.test(tweetLink)) {
        // Since setTweet is not available, we'll insert a paragraph with the link
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("paragraph")
          .insertContent(
            `<a href="${tweetLink}" target="_blank">${tweetLink}</a>`
          )
          .run();
      } else {
        if (tweetLink !== null) {
          alert("Please enter a correct Twitter Link");
        }
      }
    },
  },
];

// Configure the slash command with custom styling for smaller text
export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
    // Add a class to the command menu for smaller text
    className: "text-sm",
  },
});
