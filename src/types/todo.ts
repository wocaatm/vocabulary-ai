export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

export interface SceneRequest {
  sceneWord: string;
}

export interface SceneResponse {
  todos: Todo[];
}
