import {
  CheckSquare,
  Code,
  Image,
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

// Define a function for uploading files
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const uploadImage = (file: File, view: any, pos: number) => {
  // This is a placeholder for the actual image upload functionality
  // In a real implementation, you would upload the file to a server
  // and then insert the image at the given position
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") {
      const image = reader.result;
      view.dispatch(
        view.state.tr.insert(
          pos,
          view.state.schema.nodes.image.create({ src: image })
        )
      );
    }
  };
  reader.readAsDataURL(file);
};

interface CommandProps {
  editor: Editor;
  range: Range;
}

export const suggestionItems = [
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <TextT size={18} />,
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
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }: CommandProps) => {
      // Since toggleTaskList is not available, we'll use a regular bullet list
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <TextH size={18} />,
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
    icon: <TextHTwo size={18} />,
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
    icon: <TextHThree size={18} />,
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
    icon: <ListBullets size={18} />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListNumbers size={18} />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <Quotes size={18} />,
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
    icon: <Code size={18} />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Image",
    description: "Upload an image from your computer.",
    searchTerms: ["photo", "picture", "media"],
    icon: <Image size={18} />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).run();
      // upload image
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        if (input.files?.length) {
          const file = input.files[0];
          const pos = editor.view.state.selection.from;
          uploadImage(file, editor.view, pos);
        }
      };
      input.click();
    },
  },
  {
    title: "Youtube",
    description: "Embed a Youtube video.",
    searchTerms: ["video", "youtube", "embed"],
    icon: <YoutubeLogo size={18} />,
    command: ({ editor, range }: CommandProps) => {
      const videoLink = prompt("Please enter Youtube Video Link");
      //From https://regexr.com/3dj5t
      const ytregex = new RegExp(
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
      );

      if (videoLink && ytregex.test(videoLink)) {
        // Since setYoutubeVideo is not available, we'll insert a paragraph with the link
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("paragraph")
          .insertContent(
            `<a href="${videoLink}" target="_blank">${videoLink}</a>`
          )
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
    icon: <TwitterLogo size={18} />,
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

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});
