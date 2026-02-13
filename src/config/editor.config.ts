export const defaultEditorConfig = {
  height: 400,
  plugins: [
    "anchor",
    "autolink",
    "charmap",
    "codesample",
    "emoticons",
    "link",
    "lists",
    "media",
    "searchreplace",
    "visualblocks",
    "wordcount",
  ],
  toolbar:
    "undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
  language: "bg-BG",
  menubar: false,
  statusbar: false,
  branding: false,
  content_style: "body { font-family: Arial, sans-serif; font-size: 14px; }",
};

export const ToolbarConfig = (isDisabled: boolean) => {
  return isDisabled
    ? ""
    : "undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help";
};
