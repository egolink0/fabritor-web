import { Flex, List, Empty, Button } from "antd";
import { useEffect, useContext, useState } from "react";
import { GlobalStateContext } from "@/context";
import { SKETCH_ID } from "@/utils/constants";
import {
  DownOutlined,
  GroupOutlined,
  HeartTwoTone,
  UpCircleFilled,
  UpOutlined,
} from "@ant-design/icons";
import ContextMenu from "@/fabritor/components/ContextMenu";
import DEMO_JSON from "@/assets/demo.json";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import ListRow from "./ListRow";
import { uuid } from "@/utils";

export default function LayerPanel() {
  const {
    isReady,
    setReady,
    object: activeObject,
    setActiveObject,
    editor,
  } = useContext(GlobalStateContext);
  const [layers, setLayers] = useState([]);

  const getCanvasLayers = (objects) => {
    const _layers: any = [];
    const { length } = objects;
    if (!length) {
      setLayers([]);
      return;
    }
    const activeObject = editor?.canvas.getActiveObject();
    for (let i = length - 1; i >= 0; i--) {
      const object = objects[i];
      if (object && object.id !== SKETCH_ID) {
        if (activeObject === object) {
          object.__cover = object.toDataURL();
        } else {
          if (!object.__cover) {
            object.__cover = object.toDataURL();
          }
        }

        _layers.push({
          cover: object.__cover,
          group: object.type === "group",
          object,
          id: uuid(),
        });
      }
    }
    setLayers(_layers);
  };

  const loadDemo = async () => {
    setReady(false);
    await editor.loadFromJSON(DEMO_JSON, true);
    editor.fhistory.reset();
    setReady(true);
    setActiveObject(null);
    editor.fireCustomModifiedEvent();
  };

  const handleItemClick = (item) => {
    editor.canvas.discardActiveObject();
    editor.canvas.setActiveObject(item.object);
    editor.canvas.requestRenderAll();
  };

  useEffect(() => {
    let canvas;
    const initCanvasLayers = () => {
      getCanvasLayers(canvas.getObjects());
    };

    if (isReady) {
      setLayers([]);
      canvas = editor?.canvas;
      initCanvasLayers();

      canvas.on({
        "object:added": initCanvasLayers,
        "object:removed": initCanvasLayers,
        "object:modified": initCanvasLayers,
        "object:skewing": initCanvasLayers,
        "fabritor:object:modified": initCanvasLayers,
      });
    }

    return () => {
      if (canvas) {
        canvas.off({
          "object:added": initCanvasLayers,
          "object:removed": initCanvasLayers,
          "object:modified": initCanvasLayers,
          "object:skewing": initCanvasLayers,
          "fabritor:object:modified": initCanvasLayers,
        });
      }
    };
  }, [isReady]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      const activeIndex = layers.findIndex((i) => i.id === active.id);
      const overIndex = layers.findIndex((i) => i.id === over?.id);
      console.log(activeIndex, overIndex);
      const object = layers[activeIndex].object;
      if (object) {
        object.moveTo(layers.length - overIndex);
        getCanvasLayers(editor.canvas.getObjects());
      }
    }
  };
  console.log("item", layers);

  return (
    <div className="fabritor-panel-wrapper">
      {layers.length > 0 ? (
        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={layers.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <List
              dataSource={layers}
              renderItem={(item: any) => (
                <ContextMenu object={item.object} noCareOpen>
                  <ListRow id={item.id}>
                    <List.Item
                      className="fabritor-list-item"
                      style={{
                        border:
                          activeObject === item.object
                            ? " 2px solid #ff2222"
                            : "2px solid transparent",
                        padding: "10px 16px",
                      }}
                    >
                      <Flex
                        justify="space-between"
                        align="center"
                        style={{ width: "100%", height: 40 }}
                      >
                        <img
                          src={item.cover}
                          style={{ maxWidth: 200, maxHeight: 34 }}
                        />
                        {item.group ? (
                          <GroupOutlined
                            style={{
                              fontSize: 18,
                              color: "rgba(17, 23, 29, 0.6)",
                            }}
                          />
                        ) : null}
                      </Flex>
                    </List.Item>
                  </ListRow>
                </ContextMenu>
              )}
            />
          </SortableContext>
        </DndContext>
      ) : (
        <Empty image={null} />
      )}
    </div>
  );
}
