import { Layout, Tabs, Flex, FloatButton } from "antd";
import { useContext } from "react";
import {
  AlertOutlined,
  FileTextOutlined,
  PictureOutlined,
  BorderOutlined,
  BulbOutlined,
  AppstoreOutlined,
  GithubFilled,
} from "@ant-design/icons";
import TextPanel from "./TextPanel";
import ImagePanel from "./ImagePanel";
import ShapePanel from "./ShapePanel";
import PaintPanel from "./PaintPanel";
import LayerPanel from "./LayerPanel";
import { GlobalStateContext } from "@/context";
import AppPanel from "./AppPanel";
import { PANEL_WIDTH } from "@/config";
import TemplatePanel from "./TemplatePanel";

import "./index.scss";

const { Sider } = Layout;

const siderStyle: React.CSSProperties = {
  position: "relative",
  backgroundColor: "#fff",
  borderRight: "1px solid #e8e8e8",
};

const iconStyle = { fontSize: 18, marginRight: 0 };

const OBJECT_TYPES = [
  {
    label: "Template",
    value: "template",
    icon: <AppstoreOutlined style={iconStyle} />,
  },
  {
    label: "Layer",
    value: "layer",
    icon: <AlertOutlined style={iconStyle} />,
  },
  {
    label: "Text",
    value: "text",
    icon: <FileTextOutlined style={iconStyle} />,
  },
  {
    label: "Image",
    value: "image",
    icon: <PictureOutlined style={iconStyle} />,
  },
  {
    label: "Shape",
    value: "shape",
    icon: <BorderOutlined style={iconStyle} />,
  },
];

export default function Panel() {
  const { editor } = useContext(GlobalStateContext);

  const renderPanel = (value) => {
    if (value === "layer") {
      return <LayerPanel />;
    }
    if (value === "text") {
      return <TextPanel />;
    }
    if (value === "image") {
      return <ImagePanel />;
    }
    if (value === "template") {
      return <TemplatePanel />;
    }
    if (value === "shape") {
      return <ShapePanel />;
    }
    if (value === "paint") {
      return <PaintPanel />;
    }
    if (value === "app") {
      return <AppPanel />;
    }
    return null;
  };

  const renderLabel = (item) => {
    return (
      <Flex vertical justify="center">
        <div>{item.icon}</div>
        <div>{item.label}</div>
      </Flex>
    );
  };

  const handleTabChange = (k) => {
    if (editor?.canvas) {
      if (k === "paint") {
        editor.canvas.isDrawingMode = true;
      } else {
        editor.canvas.isDrawingMode = false;
      }
    }
  };

  return (
    <Sider style={siderStyle} width={PANEL_WIDTH} className="fabritor-sider">
      <Tabs
        tabPosition="left"
        className="tabs"
        style={{ flex: 1, overflow: "auto" }}
        size="small"
        onChange={handleTabChange}
        items={OBJECT_TYPES.map((item) => {
          return {
            label: renderLabel(item),
            key: item.value,
            children: renderPanel(item.value),
          };
        })}
      />
    </Sider>
  );
}
