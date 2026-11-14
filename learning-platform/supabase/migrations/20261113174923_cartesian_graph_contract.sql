-- ENG-01 optional graph adapter schema and math validation; no content/progress rewrites.
begin;
create or replace function lesson_private.contract_schema() returns jsonb language sql immutable set search_path='' as $body$ select $schema${
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mohoc.local/lesson.schema.json",
  "type": "object",
  "properties": {
    "schemaVersion": {
      "const": "1.0.0"
    },
    "lessonId": {
      "type": "string",
      "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
    },
    "version": {
      "type": "integer",
      "minimum": 1
    },
    "status": {
      "enum": [
        "draft",
        "published"
      ]
    },
    "locale": {
      "const": "vi-VN"
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 2000
    },
    "grade": {
      "enum": [
        6,
        7,
        8,
        9
      ]
    },
    "subject": {
      "const": "math"
    },
    "topicIds": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
      },
      "minItems": 1,
      "maxItems": 100
    },
    "learningObjectives": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1,
        "maxLength": 2000
      },
      "minItems": 1,
      "maxItems": 100
    },
    "engine": {
      "type": "object",
      "properties": {
        "type": {
          "enum": [
            "geometry_2d",
            "geometry_3d_web",
            "math_explorer_2d",
            "number_line_2d",
            "fraction_bar_2d",
            "algebra_balance_2d",
            "function_plot_2d",
            "percentage_2d",
            "ratio_2d",
            "coordinate_2d",
            "area_2d",
            "pythagorean_2d",
            "linear_plot_2d"
          ]
        },
        "minRuntimeVersion": {
          "const": "1.0.0"
        },
        "requiredCapabilities": {
          "type": "array",
          "items": {
            "enum": [
              "drag_vertex",
              "measure_angle",
              "show_geometry_annotation",
              "toggle_angle_labels",
              "drag_angle_token",
              "orbit_solid",
              "select_face",
              "fill_layers",
              "measure_volume",
              "adjust_parameter",
              "number_line_drag",
              "fraction_partition",
              "balance_equation",
              "plot_function",
              "percentage_grid",
              "ratio_table",
              "coordinate_plane",
              "rectangle_area",
              "pythagorean",
              "linear_graph"
            ]
          },
          "minItems": 1,
          "maxItems": 100,
          "uniqueItems": true
        }
      },
      "required": [
        "type",
        "minRuntimeVersion",
        "requiredCapabilities"
      ],
      "additionalProperties": false
    },
    "scene": {
      "type": "object",
      "properties": {
        "sceneId": {
          "type": "string",
          "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
        },
        "coordinateSystem": {
          "enum": [
            "cartesian_2d",
            "cartesian_3d"
          ]
        },
        "viewport": {
          "type": "object",
          "properties": {
            "width": {
              "type": "number",
              "exclusiveMinimum": 0,
              "maximum": 10000
            },
            "height": {
              "type": "number",
              "exclusiveMinimum": 0,
              "maximum": 10000
            }
          },
          "required": [
            "width",
            "height"
          ],
          "additionalProperties": false
        },
        "objects": {
          "type": "array",
          "items": {
            "oneOf": [
              {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                  },
                  "kind": {
                    "const": "point"
                  },
                  "position": {
                    "type": "array",
                    "items": {
                      "type": "number"
                    },
                    "minItems": 2,
                    "maxItems": 2
                  },
                  "draggable": {
                    "type": "boolean"
                  }
                },
                "required": [
                  "id",
                  "kind",
                  "position",
                  "draggable"
                ],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                  },
                  "kind": {
                    "const": "polygon"
                  },
                  "vertexIds": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                    },
                    "minItems": 3,
                    "maxItems": 100
                  }
                },
                "required": [
                  "id",
                  "kind",
                  "vertexIds"
                ],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                  },
                  "kind": {
                    "const": "angle_token"
                  },
                  "sourceVertexId": {
                    "type": "string",
                    "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                  }
                },
                "required": [
                  "id",
                  "kind",
                  "sourceVertexId"
                ],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                  },
                  "kind": {
                    "const": "prism"
                  },
                  "dimensions": {
                    "type": "array",
                    "items": {
                      "type": "number",
                      "exclusiveMinimum": 0,
                      "maximum": 10000
                    },
                    "minItems": 3,
                    "maxItems": 3
                  }
                },
                "required": [
                  "id",
                  "kind",
                  "dimensions"
                ],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                  },
                  "kind": {
                    "const": "math_model"
                  },
                  "model": {
                    "enum": [
                      "number_line",
                      "fraction_bar",
                      "linear_balance",
                      "quadratic_graph",
                      "percentage_grid",
                      "ratio_table",
                      "coordinate_plane",
                      "rectangle_area",
                      "pythagorean",
                      "linear_graph"
                    ]
                  },
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "x": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "a": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "b": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "c": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "numerator": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "denominator": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "targetX": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "targetRatio": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "targetA": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "targetB": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "targetC": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "y": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "width": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "height": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "targetY": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "targetWidth": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      },
                      "targetHeight": {
                        "type": "number",
                        "minimum": -1000000,
                        "maximum": 1000000
                      }
                    },
                    "required": [],
                    "additionalProperties": false
                  }
                },
                "required": [
                  "id",
                  "kind",
                  "model",
                  "parameters"
                ],
                "additionalProperties": false
              }
            ]
          },
          "minItems": 1,
          "maxItems": 100
        },
        "initialState": {
          "type": "object",
          "properties": {
            "angleLabelsVisible": {
              "type": "boolean"
            },
            "dragCount": {
              "type": "integer",
              "minimum": 0
            },
            "layers": {
              "type": "integer",
              "minimum": 0,
              "maximum": 10
            },
            "x": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "a": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "b": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "c": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "numerator": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "denominator": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "targetX": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "targetRatio": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "targetA": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "targetB": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "targetC": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "y": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "width": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "height": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "targetY": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "targetWidth": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            },
            "targetHeight": {
              "type": "number",
              "minimum": -1000000,
              "maximum": 1000000
            }
          },
          "additionalProperties": false
        }
      },
      "required": [
        "sceneId",
        "coordinateSystem",
        "viewport",
        "objects",
        "initialState"
      ],
      "additionalProperties": false
    },
    "checkpoints": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
          },
          "order": {
            "type": "integer",
            "minimum": 1
          },
          "instruction": {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          "allowedInteractions": {
            "type": "array",
            "items": {
              "enum": [
                "drag_vertex",
                "measure_angle",
                "show_geometry_annotation",
                "toggle_angle_labels",
                "drag_angle_token",
                "orbit_solid",
                "select_face",
                "fill_layers",
                "measure_volume",
                "adjust_parameter",
                "number_line_drag",
                "fraction_partition",
                "balance_equation",
                "plot_function",
                "percentage_grid",
                "ratio_table",
                "coordinate_plane",
                "rectangle_area",
                "pythagorean",
                "linear_graph"
              ]
            },
            "minItems": 1,
            "maxItems": 100,
            "uniqueItems": true
          },
          "scenePatch": {
            "type": "object",
            "properties": {
              "setState": {
                "type": "object",
                "properties": {
                  "angleLabelsVisible": {
                    "type": "boolean"
                  },
                  "dragCount": {
                    "type": "integer",
                    "minimum": 0
                  },
                  "layers": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 10
                  },
                  "x": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "a": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "b": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "c": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "numerator": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "denominator": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "targetX": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "targetRatio": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "targetA": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "targetB": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "targetC": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "y": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "width": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "height": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "targetY": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "targetWidth": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  },
                  "targetHeight": {
                    "type": "number",
                    "minimum": -1000000,
                    "maximum": 1000000
                  }
                },
                "additionalProperties": false
              },
              "addObjects": {
                "type": "array",
                "items": {
                  "oneOf": [
                    {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                        },
                        "kind": {
                          "const": "point"
                        },
                        "position": {
                          "type": "array",
                          "items": {
                            "type": "number"
                          },
                          "minItems": 2,
                          "maxItems": 2
                        },
                        "draggable": {
                          "type": "boolean"
                        }
                      },
                      "required": [
                        "id",
                        "kind",
                        "position",
                        "draggable"
                      ],
                      "additionalProperties": false
                    },
                    {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                        },
                        "kind": {
                          "const": "polygon"
                        },
                        "vertexIds": {
                          "type": "array",
                          "items": {
                            "type": "string",
                            "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                          },
                          "minItems": 3,
                          "maxItems": 100
                        }
                      },
                      "required": [
                        "id",
                        "kind",
                        "vertexIds"
                      ],
                      "additionalProperties": false
                    },
                    {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                        },
                        "kind": {
                          "const": "angle_token"
                        },
                        "sourceVertexId": {
                          "type": "string",
                          "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                        }
                      },
                      "required": [
                        "id",
                        "kind",
                        "sourceVertexId"
                      ],
                      "additionalProperties": false
                    },
                    {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                        },
                        "kind": {
                          "const": "prism"
                        },
                        "dimensions": {
                          "type": "array",
                          "items": {
                            "type": "number",
                            "exclusiveMinimum": 0,
                            "maximum": 10000
                          },
                          "minItems": 3,
                          "maxItems": 3
                        }
                      },
                      "required": [
                        "id",
                        "kind",
                        "dimensions"
                      ],
                      "additionalProperties": false
                    },
                    {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
                        },
                        "kind": {
                          "const": "math_model"
                        },
                        "model": {
                          "enum": [
                            "number_line",
                            "fraction_bar",
                            "linear_balance",
                            "quadratic_graph",
                            "percentage_grid",
                            "ratio_table",
                            "coordinate_plane",
                            "rectangle_area",
                            "pythagorean",
                            "linear_graph"
                          ]
                        },
                        "parameters": {
                          "type": "object",
                          "properties": {
                            "x": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "a": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "b": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "c": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "numerator": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "denominator": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "targetX": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "targetRatio": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "targetA": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "targetB": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "targetC": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "y": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "width": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "height": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "targetY": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "targetWidth": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            },
                            "targetHeight": {
                              "type": "number",
                              "minimum": -1000000,
                              "maximum": 1000000
                            }
                          },
                          "required": [],
                          "additionalProperties": false
                        }
                      },
                      "required": [
                        "id",
                        "kind",
                        "model",
                        "parameters"
                      ],
                      "additionalProperties": false
                    }
                  ]
                },
                "minItems": 0,
                "maxItems": 100
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "successCriteria": {
            "$ref": "#/$defs/criterion"
          },
          "hints": {
            "type": "array",
            "items": {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            },
            "minItems": 0,
            "maxItems": 100
          },
          "feedback": {
            "type": "object",
            "properties": {
              "success": {
                "type": "string",
                "minLength": 1,
                "maxLength": 2000
              }
            },
            "required": [
              "success"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "id",
          "order",
          "instruction",
          "allowedInteractions",
          "scenePatch",
          "successCriteria",
          "hints",
          "feedback"
        ],
        "additionalProperties": false
      },
      "minItems": 1,
      "maxItems": 100
    },
    "completion": {
      "type": "object",
      "properties": {
        "requiredCheckpointIds": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^[a-zA-Z][a-zA-Z0-9_-]{0,99}$"
          },
          "minItems": 1,
          "maxItems": 100,
          "uniqueItems": true
        }
      },
      "required": [
        "requiredCheckpointIds"
      ],
      "additionalProperties": false
    },
    "recognition": {
      "type": "array",
      "minItems": 1,
      "maxItems": 100,
      "items": {
        "type": "object",
        "properties": {
          "question": {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          "mode": {
            "enum": [
              "tap",
              "drag",
              "formula"
            ]
          },
          "choices": {
            "type": "array",
            "minItems": 2,
            "maxItems": 8,
            "items": {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            }
          },
          "correct": {
            "type": "integer",
            "minimum": 1,
            "maximum": 8
          },
          "explanation": {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          "hint": {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          "diagram": {
            "enum": [
              "none",
              "triangle",
              "circle",
              "cone",
              "chart"
            ]
          },
          "uime": {
            "type": "object",
            "properties": {
              "kind": {
                "enum": [
                  "TOKEN_CLASSIFIER",
                  "TAP_COEFFICIENT",
                  "NUMBER_LINE_SELECTOR",
                  "INEQUALITY_SIGN_SWITCH",
                  "FORMULA_SNAP_BUILDER",
                  "PARABOLA_SLIDER",
                  "DELTA_STATE_TOGGLE",
                  "TRIANGLE_HOTSPOT_TAP",
                  "GEOMETRIC_HOTSPOT_FINDER",
                  "ANGLE_MEASURE_TAP",
                  "3D_SOLID_INSPECTOR",
                  "CHART_BAR_TAP",
                  "EVENT_CARD_BUCKET"
                ]
              },
              "labels": {
                "type": "array",
                "items": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 2000
                },
                "minItems": 0,
                "maxItems": 100
              },
              "tokens": {
                "type": "array",
                "items": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 2000
                },
                "minItems": 0,
                "maxItems": 100
              },
              "answers": {
                "type": "array",
                "minItems": 1,
                "maxItems": 8,
                "items": {
                  "type": "number"
                }
              },
              "min": {
                "type": "number"
              },
              "max": {
                "type": "number"
              },
              "step": {
                "type": "number",
                "exclusiveMinimum": 0
              },
              "solid": {
                "enum": [
                  "cone",
                  "cylinder",
                  "sphere"
                ]
              },
              "hotspots": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "label": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 2000
                    },
                    "x": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 360
                    },
                    "y": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 240
                    },
                    "width": {
                      "type": "number",
                      "minimum": 1,
                      "maximum": 360
                    },
                    "height": {
                      "type": "number",
                      "minimum": 1,
                      "maximum": 240
                    }
                  },
                  "required": [
                    "label",
                    "x",
                    "y",
                    "width",
                    "height"
                  ],
                  "additionalProperties": false
                },
                "minItems": 0,
                "maxItems": 100
              },
              "graph": {
                "oneOf": [
                  {
                    "type": "object",
                    "properties": {
                      "a": {
                        "type": "integer",
                        "minimum": -12,
                        "maximum": 12
                      },
                      "b": {
                        "type": "integer",
                        "minimum": -12,
                        "maximum": 12
                      },
                      "c": {
                        "type": "integer",
                        "minimum": -12,
                        "maximum": 12
                      },
                      "snap": {
                        "enum": [
                          0,
                          0.5,
                          1
                        ]
                      },
                      "task": {
                        "enum": [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      },
                      "mode": {
                        "const": "linear_relation"
                      }
                    },
                    "required": [
                      "a",
                      "b",
                      "c",
                      "snap",
                      "task",
                      "mode"
                    ],
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "properties": {
                      "a": {
                        "type": "integer",
                        "minimum": -12,
                        "maximum": 12
                      },
                      "b": {
                        "type": "integer",
                        "minimum": -12,
                        "maximum": 12
                      },
                      "c": {
                        "type": "integer",
                        "minimum": -12,
                        "maximum": 12
                      },
                      "snap": {
                        "enum": [
                          0,
                          0.5,
                          1
                        ]
                      },
                      "task": {
                        "enum": [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      },
                      "mode": {
                        "const": "linear_system"
                      },
                      "d": {
                        "type": "integer",
                        "minimum": -12,
                        "maximum": 12
                      },
                      "e": {
                        "type": "integer",
                        "minimum": -12,
                        "maximum": 12
                      },
                      "f": {
                        "type": "integer",
                        "minimum": -12,
                        "maximum": 12
                      }
                    },
                    "required": [
                      "a",
                      "b",
                      "c",
                      "snap",
                      "task",
                      "mode",
                      "d",
                      "e",
                      "f"
                    ],
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "properties": {
                      "a": {
                        "type": "integer",
                        "minimum": -12,
                        "maximum": 12
                      },
                      "b": {
                        "type": "integer",
                        "minimum": -12,
                        "maximum": 12
                      },
                      "c": {
                        "type": "integer",
                        "minimum": -12,
                        "maximum": 12
                      },
                      "snap": {
                        "enum": [
                          0,
                          0.5,
                          1
                        ]
                      },
                      "task": {
                        "enum": [
                          "explore",
                          "identify",
                          "discover",
                          "guided",
                          "practice",
                          "assessment"
                        ]
                      },
                      "mode": {
                        "const": "line_parabola_intersection"
                      },
                      "q": {
                        "enum": [
                          -12,
                          -11,
                          -10,
                          -9,
                          -8,
                          -7,
                          -6,
                          -5,
                          -4,
                          -3,
                          -2,
                          -1,
                          1,
                          2,
                          3,
                          4,
                          5,
                          6,
                          7,
                          8,
                          9,
                          10,
                          11,
                          12
                        ]
                      }
                    },
                    "required": [
                      "a",
                      "b",
                      "c",
                      "snap",
                      "task",
                      "mode",
                      "q"
                    ],
                    "additionalProperties": false
                  }
                ]
              },
              "parabola": {
                "type": "object",
                "properties": {
                  "a": {
                    "enum": [
                      -5,
                      -4,
                      -3,
                      -2,
                      -1,
                      1,
                      2,
                      3,
                      4,
                      5
                    ]
                  },
                  "pointX": {
                    "enum": [
                      1,
                      2,
                      -2
                    ]
                  },
                  "task": {
                    "enum": [
                      "explore",
                      "identify",
                      "compare",
                      "guided",
                      "practice",
                      "assessment"
                    ]
                  }
                },
                "required": [
                  "a",
                  "pointX",
                  "task"
                ],
                "additionalProperties": false
              },
              "cylinder": {
                "type": "object",
                "properties": {
                  "radius": {
                    "type": "number",
                    "minimum": 0.1,
                    "maximum": 100
                  },
                  "height": {
                    "type": "number",
                    "minimum": 0.1,
                    "maximum": 100
                  },
                  "unit": {
                    "enum": [
                      "cm",
                      "m"
                    ]
                  },
                  "task": {
                    "enum": [
                      "orbit",
                      "radius",
                      "equal-bases",
                      "height",
                      "side"
                    ]
                  }
                },
                "required": [
                  "radius",
                  "height",
                  "unit",
                  "task"
                ],
                "additionalProperties": false
              },
              "svg": {
                "type": "string",
                "maxLength": 65536
              }
            },
            "required": [
              "kind",
              "labels",
              "tokens",
              "answers",
              "min",
              "max",
              "step",
              "solid",
              "hotspots"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "question",
          "mode",
          "choices",
          "correct",
          "explanation",
          "hint",
          "diagram"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "schemaVersion",
    "lessonId",
    "version",
    "status",
    "locale",
    "title",
    "grade",
    "subject",
    "topicIds",
    "learningObjectives",
    "engine",
    "scene",
    "checkpoints",
    "completion"
  ],
  "additionalProperties": false,
  "$defs": {
    "criterion": {
      "oneOf": [
        {
          "type": "object",
          "properties": {
            "op": {
              "enum": [
                "all",
                "any"
              ]
            },
            "conditions": {
              "type": "array",
              "items": {
                "$ref": "#/$defs/criterion"
              },
              "minItems": 1,
              "maxItems": 100
            }
          },
          "required": [
            "op",
            "conditions"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "op": {
              "const": "not"
            },
            "condition": {
              "$ref": "#/$defs/criterion"
            }
          },
          "required": [
            "op",
            "condition"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "op": {
              "enum": [
                "eq",
                "neq",
                "gt",
                "gte",
                "lt",
                "lte",
                "approx",
                "within"
              ]
            },
            "path": {
              "enum": [
                "metrics.validVertexDragCount",
                "metrics.validVertexDragCountSinceCheckpoint",
                "metrics.snappedAngleTokens",
                "metrics.assembledAngleDegrees",
                "metrics.orbitRadians",
                "metrics.selectedFaces",
                "metrics.filledLayers",
                "metrics.volume",
                "metrics.parameterChangeCount",
                "metrics.parameterChangeCountSinceCheckpoint",
                "metrics.modelError",
                "metrics.modelValue"
              ]
            },
            "value": {
              "type": "number"
            },
            "tolerance": {
              "type": "number",
              "minimum": 0
            },
            "max": {
              "type": "number"
            }
          },
          "required": [
            "op",
            "path",
            "value"
          ],
          "additionalProperties": false
        }
      ]
    }
  }
}$schema$::jsonb $body$;
-- Pure mathematical guard, called only after the canonical JSON Schema check.
create or replace function lesson_private.valid_cartesian_graph(g jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare a numeric=(g->>'a')::numeric;b numeric=(g->>'b')::numeric;c numeric=(g->>'c')::numeric;
 d numeric=(g->>'d')::numeric;e numeric=(g->>'e')::numeric;f numeric=(g->>'f')::numeric;
 q numeric=(g->>'q')::numeric;s numeric=(g->>'snap')::numeric;
 det numeric;disc numeric;qa numeric;v numeric;x numeric;y numeric;t numeric;coords numeric[]='{}';n numeric;
begin
 if a=0 and b=0 then return false;end if;
 if g->>'mode'='linear_relation' then
  foreach t in array array[0,2,-2,1]::numeric[] loop
   if b<>0 then x=t;y=(c-a*t)/b;else x=c/a;y=t;end if;coords=coords||array[x,y];
  end loop;
 elsif g->>'mode'='linear_system' then
  if d=0 and e=0 then return false;end if;
  det=a*e-d*b;
  if det<>0 then coords=array[(c*e-f*b)/det,(a*f-d*c)/det];end if;
 else
  if q=0 then return false;end if;qa=b*q;
  if qa=0 then x=c/a;coords=array[x,q*x*x];
  else
   disc=a*a+4*qa*c;
   if disc=0 then x=-a/(2*qa);coords=array[x,q*x*x];
   elsif disc>0 then
    v=-0.5*(a+case when a>=0 then 1 else -1 end*sqrt(disc));
    x=v/qa;y=-c/v;coords=array[x,q*x*x,y,q*y*y];
   end if;
  end if;
 end if;
 foreach n in array coords loop
  if abs(n)>1000 then return false;end if;
  if s<>0 and abs(n/s-round(n/s))>0.00000001 then return false;end if;
 end loop;
 return true;
exception when others then return false;
end$$;
revoke all on function lesson_private.valid_cartesian_graph(jsonb) from public;
grant execute on function lesson_private.valid_cartesian_graph(jsonb) to authenticated;

-- Recursive validator for the exact JSON Schema vocabulary used by this project.
create or replace function lesson_private.schema_valid(v jsonb,s jsonb,root jsonb,depth integer default 0) returns boolean language plpgsql immutable set search_path='' as $$
declare t text;k text;item jsonb;n integer;valid boolean;ty text;
begin
 if depth>32 then return false;end if;
 if s ? '$ref' then return lesson_private.schema_valid(v,root#>string_to_array(substr(s->>'$ref',3),'/'),root,depth+1);end if;
 if s ? 'oneOf' then n=0;for item in select value from jsonb_array_elements(s->'oneOf') loop if lesson_private.schema_valid(v,item,root,depth+1) then n=n+1;end if;end loop;return n=1;end if;
 if s ? 'const' and v is distinct from s->'const' then return false;end if;
 if s ? 'enum' and not exists(select 1 from jsonb_array_elements(s->'enum') x where x.value=v) then return false;end if;
 t=s->>'type';ty=jsonb_typeof(v);
 if t='integer' then if ty<>'number' or (v#>>'{}')::numeric<>trunc((v#>>'{}')::numeric) then return false;end if;
 elsif t is not null and t is distinct from ty then return false;end if;
 if ty='object' and t='object' then
  for item in select value from jsonb_array_elements(coalesce(s->'required','[]')) loop if not v ? (item#>>'{}') then return false;end if;end loop;
  for k,item in select * from jsonb_each(v) loop
   if not (coalesce(s->'properties','{}') ? k) then if s->'additionalProperties'='false'::jsonb then return false;end if;
   elsif not lesson_private.schema_valid(item,s->'properties'->k,root,depth+1) then return false;end if;
  end loop;
 elsif ty='array' and t='array' then
  n=jsonb_array_length(v);if n<coalesce((s->>'minItems')::integer,0) or n>coalesce((s->>'maxItems')::integer,1000000) then return false;end if;
  if s->'uniqueItems'='true'::jsonb and (select count(distinct value) from jsonb_array_elements(v))<>n then return false;end if;
  for item in select value from jsonb_array_elements(v) loop if not lesson_private.schema_valid(item,s->'items',root,depth+1) then return false;end if;end loop;
 elsif ty='number' then
  if s ? 'minimum' and (v#>>'{}')::numeric<(s->>'minimum')::numeric then return false;end if;
  if s ? 'maximum' and (v#>>'{}')::numeric>(s->>'maximum')::numeric then return false;end if;
  if s ? 'exclusiveMinimum' and (v#>>'{}')::numeric<=(s->>'exclusiveMinimum')::numeric then return false;end if;
 elsif ty='string' then
  if length(v#>>'{}')<coalesce((s->>'minLength')::integer,0) or length(v#>>'{}')>coalesce((s->>'maxLength')::integer,10000000) then return false;end if;
  if s ? 'pattern' and (v#>>'{}')!~(s->>'pattern') then return false;end if;
 end if;
 return true;
exception when others then return false;
end$$;

create or replace function lesson_private.valid_manifest(m jsonb) returns boolean language plpgsql stable set search_path='' as $$
declare cp jsonb;o jsonb;cap jsonb;objects jsonb;ids text[]='{}';cps text[]='{}';i integer=0;registry jsonb;ref text;refs text[];t jsonb;u jsonb;a jsonb;j integer;target numeric;
begin
 if octet_length(m::text)>131072 or not lesson_private.schema_valid(m,lesson_private.contract_schema(),lesson_private.contract_schema()) then return false;end if;
 select capabilities into registry from public.engine_registry where engine_type=m#>>'{engine,type}' and is_enabled;
 if registry is null or not registry @> (m#>'{engine,requiredCapabilities}') then return false;end if;
 if ((m#>>'{engine,type}')<>'geometry_3d_web')<>((m#>>'{scene,coordinateSystem}')='cartesian_2d') then return false;end if;
 objects=m#>'{scene,objects}';
 if m ? 'recognition' then
  if jsonb_array_length(m->'recognition')<>jsonb_array_length(m->'checkpoints') or m#>>'{engine,type}'<>'math_explorer_2d' then return false;end if;
  for t in select value from jsonb_array_elements(m->'recognition') loop
   if not(t ? 'uime') then continue;end if;u=t->'uime';a=u->'answers';
   if u ? 'graph' then
    if u->>'kind'<>'PARABOLA_SLIDER' or u ? 'parabola' or u ? 'cylinder' or not lesson_private.valid_cartesian_graph(u->'graph') then return false;end if;
   end if;
   if u ? 'parabola' then
    if u->>'kind'<>'PARABOLA_SLIDER' or u ? 'cylinder' or (u->>'min')::numeric<>-5 or (u->>'max')::numeric<>5 or (u->>'step')::numeric<>1 or jsonb_array_length(a)<>1 or (a->>0)::numeric<>(u#>>'{parabola,a}')::numeric then return false;end if;
   end if;
   if u ? 'cylinder' then
    if u->>'kind'<>'3D_SOLID_INSPECTOR' or u->>'solid'<>'cylinder' or jsonb_array_length(u->'tokens')<>5 or (u#>>'{cylinder,height}')::numeric/(u#>>'{cylinder,radius}')::numeric not between 0.1 and 10 then return false;end if;
   end if;
   if (u->>'min')::numeric >= (u->>'max')::numeric then return false;end if;
   if u->>'kind' in ('TOKEN_CLASSIFIER','EVENT_CARD_BUCKET') and jsonb_array_length(u->'tokens')<>jsonb_array_length(a) then return false;end if;
   if u->>'kind'='FORMULA_SNAP_BUILDER' and jsonb_array_length(u->'labels')<>jsonb_array_length(a) then return false;end if;
   if u->>'kind'='NUMBER_LINE_SELECTOR' and (jsonb_array_length(a)<>3 or (u->>'min')::numeric < -10 or (u->>'max')::numeric > 10) then return false;end if;
   if u->>'kind'='GEOMETRIC_HOTSPOT_FINDER' and jsonb_array_length(a)<>2 then return false;end if;
   for j in 0..jsonb_array_length(a)-1 loop
    target=(a->>j)::numeric;
    if j=0 and u->>'kind' in ('PARABOLA_SLIDER','NUMBER_LINE_SELECTOR','GEOMETRIC_HOTSPOT_FINDER') then
     if target<(u->>'min')::numeric or target>(u->>'max')::numeric or abs((target-(u->>'min')::numeric)/(u->>'step')::numeric-round((target-(u->>'min')::numeric)/(u->>'step')::numeric))>0.000001 then return false;end if;
    elsif u->>'kind'='NUMBER_LINE_SELECTOR' then if target not in (0,1) then return false;end if;
    else if target<>trunc(target) or target<0 or target>=jsonb_array_length(case when u->>'kind' in ('TOKEN_CLASSIFIER','EVENT_CARD_BUCKET') then u->'labels' else u->'tokens' end) then return false;end if;
    end if;
   end loop;
   for o in select value from jsonb_array_elements(u->'hotspots') loop if (o->>'x')::numeric+(o->>'width')::numeric>360 or (o->>'y')::numeric+(o->>'height')::numeric>240 then return false;end if;end loop;
  end loop;
 end if;
 for cp in select value from jsonb_array_elements(m->'checkpoints') loop
  i=i+1;if (cp->>'order')::integer<>i or cp->>'id'=any(cps) then return false;end if;cps=array_append(cps,cp->>'id');
  if not registry @> (cp->'allowedInteractions') or not (m#>'{engine,requiredCapabilities}') @> (cp->'allowedInteractions') then return false;end if;
  objects=objects||coalesce(cp#>'{scenePatch,addObjects}','[]');
 end loop;
 for o in select value from jsonb_array_elements(objects) loop
  if o->>'id'=any(ids) then return false;end if;ids=array_append(ids,o->>'id');
  if o->>'kind'='polygon' then
   refs=array(select value#>>'{}' from jsonb_array_elements(o->'vertexIds'));
   if cardinality(refs)<>3 or (select count(distinct x) from unnest(refs) x)<>3 then return false;end if;
   foreach ref in array refs loop if not exists(select 1 from jsonb_array_elements(objects) x where x->>'id'=ref and x->>'kind'='point') then return false;end if;end loop;
  elsif o->>'kind'='angle_token' and not exists(select 1 from jsonb_array_elements(objects) x where x->>'id'=o->>'sourceVertexId' and x->>'kind'='point') then return false;
  end if;
 end loop;
 if m#>>'{engine,type}'='geometry_2d' and not exists(select 1 from jsonb_array_elements(m#>'{scene,objects}') x where x->>'kind'='polygon') then return false;end if;
 if m#>>'{engine,type}'='geometry_3d_web' and (select count(*) from jsonb_array_elements(m#>'{scene,objects}') x where x->>'kind'='prism')<>1 then return false;end if;
 if cardinality(cps)<>jsonb_array_length(m#>'{completion,requiredCheckpointIds}') then return false;end if;
 for o in select value from jsonb_array_elements(m#>'{completion,requiredCheckpointIds}') loop if not (o#>>'{}')=any(cps) then return false;end if;end loop;
 return true;
exception when others then return false;
end$$;
create or replace function lesson_private.validate_draft() returns trigger language plpgsql set search_path='' as $$begin
 if not lesson_private.valid_manifest(new.draft) or new.id<>new.draft->>'lessonId' or new.draft->>'status'<>'draft' then raise exception 'Invalid lesson contract';end if;return new;
end$$;

revoke all on function lesson_private.schema_valid(jsonb,jsonb,jsonb,integer),lesson_private.valid_manifest(jsonb),lesson_private.validate_draft() from public;
grant execute on function lesson_private.schema_valid(jsonb,jsonb,jsonb,integer),lesson_private.valid_manifest(jsonb),lesson_private.contract_schema() to authenticated;

commit;
