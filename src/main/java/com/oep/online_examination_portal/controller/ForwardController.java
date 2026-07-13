package com.oep.online_examination_portal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ForwardController {

    // Catch-all route to forward frontend routes to React Router (index.html) served from static resources
    @GetMapping({"/", "/login", "/register", "/dashboard", "/quizzes/**", "/teacher/**", "/submissions/**", "/history", "/admin/**"})
    public String forward() {
        return "forward:/index.html";
    }
}
