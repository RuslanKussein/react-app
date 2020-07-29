import styles from "./App.module.css";
import {ReactComponent as Check} from "./check.svg";
import React from "react";
import {Stories, Story} from "./App";

type ListProps = {
    list: Stories;
    onRemoveItem: (item: Story) => void;
};

const List = ({ list, onRemoveItem } : ListProps) =>
    <>
        {list.map(item => (
            <Item
                key={item.objectID}
                item={item}
                onRemoveItem={onRemoveItem}/>
        ))}
    </>

type ItemProps = {
    item: Story;
    onRemoveItem: (item: Story) => void;
}

const Item = ({ item, onRemoveItem }: ItemProps) => (
    <div>
            <span>
              <a href={item.url}>{item.title}</a>
            </span>
        <span>{item.author}</span>
        <span>{item.num_comments}</span>
        <span>{item.points}</span>
        <span>
                 <button
                     type="button"
                     onClick={() => onRemoveItem(item)}
                     className={`${styles.button} ${styles.buttonSmall}`}
                 >
                    <Check height="18px" width="18px" />
                </button>
            </span>
    </div>
);

export default List;

