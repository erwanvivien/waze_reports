"use client";

import React, { PropsWithChildren, useState } from "react";

import styles from "./page.module.css";
import {
  OptionCategoryDefinition,
  WazeCategory,
  WazeCategoriesTranslation,
  categories,
} from "./wazeCategories";
import {
  subtypeSchema,
  toDatabase,
  typeSchema,
  WazeSubtype,
  WazeType,
} from "./api/heatmap/schema";

const isSubtype = (value: string): value is WazeSubtype =>
  subtypeSchema.safeParse(value).success;

type OptionCategoryProps = ModalProps & {
  categoryDefinition: OptionCategoryDefinition[WazeCategory];
  headingLevel: number;
};

const OptionCategory: React.FC<OptionCategoryProps> = ({
  types,
  setTypes,
  subtypes,
  setSubtypes,
  categoryDefinition,
  headingLevel,
}) => {
  const Tag = `h${headingLevel}` as unknown as React.FC<PropsWithChildren<{}>>;

  let OptionalSplitter: React.ReactNode = null;
  if (headingLevel === 3) {
    OptionalSplitter = <div style={{ height: 16 }} />;
  } else if (headingLevel === 4) {
    OptionalSplitter = <div style={{ height: 8 }} />;
  }

  if (Array.isArray(categoryDefinition)) {
    return (
      <div className={styles.input_wrapper}>
        {categoryDefinition.map((value) => {
          const subtypeParsed = subtypeSchema.parse(value);
          const checked = subtypes.includes(subtypeParsed);

          return (
            <div
              key={value}
              className={styles.input_option}
              onClick={(e) => {
                e.preventDefault();
                setSubtypes((subtypes) => {
                  if (checked === false) {
                    return [...subtypes, subtypeParsed];
                  } else {
                    return subtypes.filter(
                      (subtype) => subtype !== subtypeParsed
                    );
                  }
                });
              }}
            >
              {checked ? "✅" : "❌"}
              <span>{WazeCategoriesTranslation[value]}</span>
            </div>
          );
        })}
      </div>
    );
  } else {
    return Object.entries(categoryDefinition ?? {}).map(([key, value]) => (
      <React.Fragment key={key}>
        {OptionalSplitter}
        <div
          className={styles.input_option}
          onClick={(e) => {
            e.preventDefault();

            const typeParsed = typeSchema.safeParse(key);
            const subtypeParsed = subtypeSchema.safeParse(key);

            if (typeParsed.success) {
              const checked = types.includes(typeParsed.data);

              setTypes((types) => {
                if (checked === false) {
                  return [...types, typeParsed.data];
                } else {
                  return types.filter((type) => type !== typeParsed.data);
                }
              });

              const flippedTypes = toDatabase[typeParsed.data];
              setSubtypes((subtypes) => {
                if (checked === false) {
                  return [...subtypes, ...flippedTypes.filter(isSubtype)];
                } else {
                  return subtypes.filter(
                    (subtype) => !flippedTypes.includes(subtype)
                  );
                }
              });
            } else if (subtypeParsed.success) {
              const checked = subtypes.includes(subtypeParsed.data);
              const flippedTypes = toDatabase[subtypeParsed.data];

              setSubtypes((subtypes) => {
                if (checked === false) {
                  return [...subtypes, ...flippedTypes.filter(isSubtype)];
                } else {
                  return subtypes.filter(
                    (subtype) => !flippedTypes.includes(subtype)
                  );
                }
              });
            } else {
              throw new Error("Invalid key");
            }
          }}
        >
          {types.includes(key as WazeType) ||
          subtypes.includes(key as WazeSubtype)
            ? "✅"
            : "❌"}
          <Tag>{WazeCategoriesTranslation[key as WazeCategory]}</Tag>
        </div>
        <OptionCategory
          types={types}
          setTypes={setTypes}
          subtypes={subtypes}
          setSubtypes={setSubtypes}
          categoryDefinition={value}
          headingLevel={headingLevel + 1}
        />
      </React.Fragment>
    ));
  }
};

type ModalProps = OptionModalProps & {};

const Modal: React.FC<ModalProps> = ({
  types,
  setTypes,
  subtypes,
  setSubtypes,
}) => {
  return (
    <div
      className={styles.modal_panel}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <h2>Options</h2>
      <OptionCategory
        types={types}
        setTypes={setTypes}
        subtypes={subtypes}
        setSubtypes={setSubtypes}
        categoryDefinition={categories}
        headingLevel={3}
      />
    </div>
  );
};

type ButtonProps = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
};

const Button: React.FC<ButtonProps> = ({ setIsOpen }) => (
  <button
    className={styles.button}
    onClick={() => setIsOpen((value) => !value)}
  >
    Open Modal
  </button>
);

type OptionModalProps = {
  types: WazeType[];
  setTypes: React.Dispatch<React.SetStateAction<WazeType[]>>;
  subtypes: WazeSubtype[];
  setSubtypes: React.Dispatch<React.SetStateAction<WazeSubtype[]>>;
};

export const OptionModal: React.FC<OptionModalProps> = ({
  types,
  setTypes,
  subtypes,
  setSubtypes,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.modal_root}>
      <div className={styles.modal_button}>
        <Button isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>

      {isOpen && (
        <div className={styles.modal_wrapper} onClick={() => setIsOpen(false)}>
          <Modal
            types={types}
            setTypes={setTypes}
            subtypes={subtypes}
            setSubtypes={setSubtypes}
          />
        </div>
      )}
    </div>
  );
};
