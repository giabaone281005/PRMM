begin;
create function lesson_private.contract_schema() returns jsonb language sql immutable set search_path='' as $body$ select $schema${
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
declare cp jsonb;o jsonb;cap jsonb;objects jsonb;ids text[]='{}';cps text[]='{}';i integer=0;registry jsonb;ref text;refs text[];
begin
 if octet_length(m::text)>131072 or not lesson_private.schema_valid(m,lesson_private.contract_schema(),lesson_private.contract_schema()) then return false;end if;
 select capabilities into registry from public.engine_registry where engine_type=m#>>'{engine,type}' and is_enabled;
 if registry is null or not registry @> (m#>'{engine,requiredCapabilities}') then return false;end if;
 if ((m#>>'{engine,type}')<>'geometry_3d_web')<>((m#>>'{scene,coordinateSystem}')='cartesian_2d') then return false;end if;
 objects=m#>'{scene,objects}';
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
create trigger validate_lesson_draft before insert or update of draft on public.lessons for each row execute function lesson_private.validate_draft();
revoke all on function lesson_private.schema_valid(jsonb,jsonb,jsonb,integer),lesson_private.valid_manifest(jsonb),lesson_private.validate_draft() from public;
grant execute on function lesson_private.schema_valid(jsonb,jsonb,jsonb,integer),lesson_private.valid_manifest(jsonb),lesson_private.contract_schema() to authenticated;

commit;
